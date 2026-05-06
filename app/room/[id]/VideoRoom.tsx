"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import DailyIframe, { type DailyCall, type DailyParticipant } from "@daily-co/daily-js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";

interface Props {
  bookingId: string;
  userName: string;
  isTeacher: boolean;
  scheduledAt: string;
  durationMins: number;
}

function ParticipantTile({ participant }: { participant: DailyParticipant }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const videoTrack = participant.tracks.video?.persistentTrack;
    if (videoRef.current && videoTrack) {
      videoRef.current.srcObject = new MediaStream([videoTrack]);
    }
  }, [participant.tracks.video?.persistentTrack]);

  useEffect(() => {
    const audioTrack = participant.tracks.audio?.persistentTrack;
    if (audioRef.current && audioTrack && !participant.local) {
      audioRef.current.srcObject = new MediaStream([audioTrack]);
    }
  }, [participant.tracks.audio?.persistentTrack, participant.local]);

  const videoState = participant.tracks.video?.state;
  const videoOff = !videoState || videoState === "off" || videoState === "blocked" || videoState === "interrupted";

  return (
    <div className="relative bg-zinc-800 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
      {videoOff ? (
        <div className="flex flex-col items-center gap-2 text-zinc-400">
          <VideoOff className="h-8 w-8" />
          <span className="text-sm">{participant.user_name ?? "Participant"}</span>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={participant.local}
          className="w-full h-full object-cover"
        />
      )}
      {!participant.local && <audio ref={audioRef} autoPlay />}
      <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-0.5 rounded">
        {participant.user_name ?? "Participant"}{participant.local ? " (you)" : ""}
      </div>
      {participant.tracks.audio?.state === "off" && (
        <div className="absolute top-2 right-2">
          <MicOff className="h-4 w-4 text-red-400" />
        </div>
      )}
    </div>
  );
}

export function VideoRoom({ bookingId, userName, isTeacher, scheduledAt, durationMins }: Props) {
  const router = useRouter();
  const callRef = useRef<DailyCall | null>(null);
  const isMountedRef = useRef(true);
  const [status, setStatus] = useState<"lobby" | "loading" | "joined" | "error">("lobby");
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [participants, setParticipants] = useState<DailyParticipant[]>([]);

  const updateParticipants = useCallback(() => {
    if (!callRef.current) return;
    setParticipants(Object.values(callRef.current.participants()));
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      callRef.current?.destroy();
      callRef.current = null;
    };
  }, []);

  useEffect(() => {
    const startTime = new Date(scheduledAt);
    const endTime = new Date(scheduledAt);
    endTime.setMinutes(endTime.getMinutes() + durationMins);

    const timer = setInterval(() => {
      const now = Date.now();
      if (now < startTime.getTime()) {
        const msUntil = startTime.getTime() - now;
        const totalMins = Math.ceil(msUntil / 60000);
        let label: string;
        if (totalMins >= 1440) {
          const days = Math.floor(totalMins / 1440);
          const hrs = Math.floor((totalMins % 1440) / 60);
          label = hrs > 0 ? `Starts in ${days}d ${hrs}h` : `Starts in ${days}d`;
        } else if (totalMins >= 60) {
          const hrs = Math.floor(totalMins / 60);
          const mins = totalMins % 60;
          label = mins > 0 ? `Starts in ${hrs}h ${mins}m` : `Starts in ${hrs}h`;
        } else {
          label = `Starts in ${totalMins}m`;
        }
        setTimeLeft(label);
      } else if (now >= endTime.getTime()) {
        setTimeLeft("Session ended");
        clearInterval(timer);
      } else {
        const remaining = endTime.getTime() - now;
        const m = Math.floor(remaining / 60000);
        const s = Math.floor((remaining % 60000) / 1000);
        setTimeLeft(`${m}:${s.toString().padStart(2, "0")} left`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [scheduledAt, durationMins]);

  async function joinRoom() {
    setStatus("loading");
    try {
      const res = await fetch(`/api/bookings/${bookingId}/room`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to get room");
      if (!isMountedRef.current) return;

      const existing = DailyIframe.getCallInstance();
      if (existing) {
        await existing.destroy();
        await new Promise((r) => setTimeout(r, 500));
      }
      if (!isMountedRef.current) return;

      const call = DailyIframe.createCallObject();
      callRef.current = call;

      call
        .on("joined-meeting", () => {
          if (!isMountedRef.current) return;
          setStatus("joined");
          updateParticipants();
        })
        .on("participant-joined", () => { if (isMountedRef.current) updateParticipants(); })
        .on("participant-updated", () => { if (isMountedRef.current) updateParticipants(); })
        .on("participant-left", () => { if (isMountedRef.current) updateParticipants(); })
        .on("left-meeting", () => {
          if (isMountedRef.current) router.push(isTeacher ? "/dashboard/teacher" : "/dashboard/student");
        })
        .on("error", (e) => {
          console.error("Daily error", e);
          if (isMountedRef.current) { toast.error("Video call error"); setStatus("error"); }
        });

      await call.join({
        url: data.roomUrl,
        token: data.token,
        userName,
      });

    } catch (err) {
      console.error("Join room failed", err);
      if (isMountedRef.current) {
        toast.error(err instanceof Error ? err.message : "Could not join room");
        setStatus("error");
      }
    }
  }

  async function handleLeave() {
    const confirmed = window.confirm(
      isTeacher
        ? "End the session? This will mark the session as completed and release payment."
        : "Leave the session?"
    );
    if (!confirmed) return;

    if (isTeacher) {
      try {
        const res = await fetch(`/api/bookings/${bookingId}/complete`, { method: "POST" });
        if (!res.ok) {
          const data = await res.json();
          // Session not long enough — just leave without completing
          if (res.status === 400 && data.error?.includes("80%")) {
            toast.info("Session ended early — credit will not be charged.");
          }
        }
      } catch { /* non-blocking */ }
    }
    await callRef.current?.leave();
  }

  function toggleMic() {
    if (!callRef.current) return;
    callRef.current.setLocalAudio(!micOn);
    setMicOn((v) => !v);
  }

  function toggleCam() {
    if (!callRef.current) return;
    callRef.current.setLocalVideo(!camOn);
    setCamOn((v) => !v);
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="text-white font-medium text-sm">KoreanLive</span>
          {status === "joined" && (
            <Badge variant="outline" className="text-green-400 border-green-400 text-xs">Live</Badge>
          )}
        </div>
        {timeLeft && <span className="text-zinc-400 text-sm">{timeLeft}</span>}
      </div>

      {/* Video grid */}
      <div className="flex-1 p-4">
        {status === "lobby" && (
          <div className="h-full flex flex-col items-center justify-center gap-6 text-zinc-400">
            <div className="text-center space-y-2">
              <p className="text-white text-lg font-medium">Ready to join?</p>
              <p className="text-sm">Your camera and microphone will be requested after joining.</p>
            </div>
            <Button size="lg" onClick={joinRoom} className="px-8">
              Join Room
            </Button>
          </div>
        )}
        {status === "loading" && (
          <div className="h-full flex items-center justify-center text-zinc-400">
            Connecting to room…
          </div>
        )}
        {status === "error" && (
          <div className="h-full flex flex-col items-center justify-center gap-4 text-zinc-400">
            <p>Could not connect to the video room.</p>
            <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        )}
        {status === "joined" && (
          <div className={`h-full grid gap-4 ${participants.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
            {participants.map((p) => (
              <ParticipantTile key={p.session_id} participant={p} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom controls */}
      {status === "joined" && (
        <div className="flex items-center justify-center gap-4 py-4 bg-zinc-900 border-t border-zinc-800">
          <button
            onClick={toggleMic}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              micOn ? "bg-zinc-700 hover:bg-zinc-600" : "bg-red-600 hover:bg-red-500"
            }`}
          >
            {micOn ? <Mic className="h-5 w-5 text-white" /> : <MicOff className="h-5 w-5 text-white" />}
          </button>
          <button
            onClick={toggleCam}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              camOn ? "bg-zinc-700 hover:bg-zinc-600" : "bg-red-600 hover:bg-red-500"
            }`}
          >
            {camOn ? <Video className="h-5 w-5 text-white" /> : <VideoOff className="h-5 w-5 text-white" />}
          </button>
          <button
            onClick={handleLeave}
            className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-colors"
          >
            <PhoneOff className="h-5 w-5 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}
