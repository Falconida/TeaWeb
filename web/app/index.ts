import "webrtc-adapter";
import "broadcastchannel-polyfill";
import "./index.scss";
import "./FileTransfer";

import "./audio-lib";

import "./hooks/ServerConnection";
import "./hooks/ExternalModal";
import "./hooks/AudioRecorder";

import "./UnloadHandler";

export = require("tc-shared/main");