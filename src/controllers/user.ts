import { Request, Response } from "express";
import path from 'path';

export let requireLogin = (req: Request, res: Response, next: any) => {
    if(!req.isAuthenticated()) {
      res.redirect('/login');
    } else {
      next();
    }
}

export let getMainPage = (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/personal.html'));
}
export let stopSession = (req: Request, res: Response) => {
        req.session.destroy(function(err: Error) {
           if(err) throw err;
           res.redirect("/");
        })
    }

export let getLoginPage = (req: Request, res: Response) => {
    res.render('signIn');
    //res.sendFile(path.join(__dirname, '../public/login/signIn.html'));
  }