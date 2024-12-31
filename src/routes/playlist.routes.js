import { Router } from "express";
import { CreatePlaylist, getUserplaylists, GetPlaylistID, addvidoeToPlaylist, removevideofromplaylist, updatePlaylist } from "../controllers/playlist.contoller.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";
const router = Router(); // Initialize the router correctly

// Define routes
router.route("/CreatePlaylist").post( verifyjwt , CreatePlaylist);
router.route("/UserPlaylist/c/:userID").get(verifyjwt, getUserplaylists);

// Get details of a specific playlist by PlaylistId
router.route("/playlist/c/:PlaylistId").get( GetPlaylistID);
router.route("/Add/c/:PlaylistId/video/c/:videoID").post(addvidoeToPlaylist);
router.route("/remove/c/:PlaylistId/video/c/:videoID").delete(removevideofromplaylist)
router.route("/update/c/:PlaylistId").put(updatePlaylist)
export default router; // Export the router
