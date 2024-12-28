import { Router } from "express";
import { CreatePlaylist, getUserplaylists, GetPlaylistID, addvidoeToPlaylist, removevideofromplaylist, updatePlaylist } from "../controllers/playlist.contoller.js";

const router = Router(); // Initialize the router correctly

// Define routes
router.route("/CreatePlaylist").post(CreatePlaylist);
// Add other routes as needed, for example:
// router.route("/getUserPlaylists").get(getUserplaylists);

export default router; // Export the router
