import { Paddle } from "@paddle/paddle-node-sdk";

let _paddle: Paddle | null = null;

export function getPaddle(): Paddle {
  if (!_paddle) {
    if (!process.env.PADDLE_API_KEY) throw new Error("PADDLE_API_KEY not set");
    _paddle = new Paddle(process.env.PADDLE_API_KEY);
  }
  return _paddle;
}
