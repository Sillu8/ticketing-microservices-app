import express from 'express';
import { currentUser } from '../middlewares/currentUser';


const router = express.Router();

router.get('/api/users/currentuser', currentUser, (req, res) => {
  res.send({ currentUser: req.currentUser || null}); //if no value exists send null
});


export { router as currentUserRouter };