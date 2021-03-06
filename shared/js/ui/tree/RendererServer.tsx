import * as React from "react";
import {RemoteIconRenderer} from "tc-shared/ui/react-elements/Icon";
import {Settings, settings} from "tc-shared/settings";
import {UnreadMarkerRenderer} from "./RendererTreeEntry";
import {getIconManager} from "tc-shared/file/Icons";
import {RDPServer} from "tc-shared/ui/tree/RendererDataProvider";
import {Translatable, VariadicTranslatable} from "tc-shared/ui/react-elements/i18n";

const serverStyle = require("./Server.scss");
const viewStyle = require("./View.scss");

export class ServerRenderer extends React.Component<{ server: RDPServer }, {}> {
    render() {
        const server = this.props.server;
        const selected = this.props.server.selected;
        const events = server.getEvents();

        let name, icon;
        switch (server.state?.state) {
            case undefined:
                name = null;
                break;

            case "disconnected":
                name = <Translatable key={"not-connected"}>Not connected to any server</Translatable>;
                break;

            case "connecting":
                name = <VariadicTranslatable text={"Connecting to {}"} key={"connecting"}>{server.state.targetAddress}</VariadicTranslatable>;
                break;

            case "connected":
                name = <React.Fragment key={"server-name"}>{server.state.name}</React.Fragment>;
                icon = <RemoteIconRenderer icon={getIconManager().resolveIcon(server.state.icon.iconId, server.state.icon.serverUniqueId, server.getHandlerId())} key={"server-icon"} />;
                break;
        }

        return (
            <div
                className={serverStyle.serverEntry + " " + viewStyle.treeEntry + " " + (selected ? viewStyle.selected : "")}
                style={{ top: server.offsetTop }}
                onMouseUp={event => {
                    if (event.button !== 0) {
                        return; /* only left mouse clicks */
                    }

                    events.fire("action_select", {
                        entryIds: [ server.entryId ],
                        mode: "auto",
                        ignoreClientMove: false
                    });
                }}
                onContextMenu={event => {
                    if (settings.static(Settings.KEY_DISABLE_CONTEXT_MENU)) {
                        return;
                    }

                    event.preventDefault();
                    events.fire("action_show_context_menu", { treeEntryId: server.entryId, pageX: event.pageX, pageY: event.pageY });
                }}
            >
                <div className={viewStyle.leftPadding} style={{ paddingLeft: server.offsetLeft + "em" }} />
                <UnreadMarkerRenderer entry={server} ref={server.refUnread} />
                <div className={"icon client-server_green " + serverStyle.server_type}/>
                <div className={serverStyle.name}>{name}</div>
                {icon}
            </div>
        );
    }
}