import App from "../App";
import { NextFunction, Request, Response } from "express";

export function sendIndexHtml(req: Request, res: Response, next: NextFunction) {
  res.sendFile(App.staticFilesPath + "/index.html");
}
