import {Registry} from "tc-shared/events";
import {ChannelTreeUIEvents} from "tc-shared/ui/tree/Definitions";
import * as React from "react";
import {ChannelTreeView, PopoutButton} from "tc-shared/ui/tree/RendererView";
import {RDPChannelTree} from "./RendererDataProvider";
import {useEffect, useRef} from "react";

const viewStyle = require("./View.scss");

export const ChannelTreeRenderer = (props: { handlerId: string, events: Registry<ChannelTreeUIEvents> }) => {
    const dataProvider = new RDPChannelTree(props.events, props.handlerId);
    dataProvider.initialize();
    useEffect(() => () => dataProvider.destroy());

    return <ContainerView tree={dataProvider} events={props.events} />;
}

const ContainerView = (props: { tree: RDPChannelTree, events: Registry<ChannelTreeUIEvents> }) => {
    const refContainer = useRef<HTMLDivElement>();
    const focusWithin = useRef(false);

    useEffect(() => {
        let mouseDownListener;
        document.addEventListener("mousedown", mouseDownListener = event => {
            let target = event.target as HTMLElement;
            while(target !== refContainer.current && target) { target = target.parentElement; }

            focusWithin.current = !!target;
        });

        let keyListener;
        document.addEventListener("keydown", keyListener = event => {
            if(!focusWithin.current) { return; }

            if(event.key === "ArrowUp") {
                event.preventDefault();
                props.events.fire("action_select_auto", { direction: "previous" });
            } else if(event.key === "ArrowDown") {
                event.preventDefault();
                props.events.fire("action_select_auto", { direction: "next" });
            } else if(event.key === "Enter") {
                event.preventDefault();
                props.events.fire("action_channel_join", { treeEntryId: "selected", ignoreMultiSelect: false });
            }
        });

        return () => {
            document.removeEventListener("mousedown", mouseDownListener);
            document.removeEventListener("keypress", keyListener);
        }
    });

    return (
        <div className={viewStyle.treeContainer} ref={refContainer}>
            <ChannelTreeView events={props.events} dataProvider={props.tree} ref={props.tree.refTree} />
            <PopoutButton tree={props.tree} ref={props.tree.refPopoutButton} />
        </div>
    )
}