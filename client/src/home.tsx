import { Route } from "./+types/home";

import { useState } from "react";
import {
    Alert,
    Button,
    Center,
    Group,
    Loader,
    Stack,
    Switch
} from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { Chess, NormalMove } from "chessops";
import { makeFen } from "chessops/fen";

import { BoardState } from "./types/BoardState";
import { generateDefaultPieces } from "./constants/llms";
import Board from "./Board";
import styles from "./home.module.css";

export function clientLoader() {
    return (): BoardState => ({
        position: Chess.default(),
        llms: generateDefaultPieces()
    });
}

function Home({ loaderData: defaultState }: Route.ComponentProps) {
    const [ stateHistory, setStateHistory ] = useListState([defaultState()]);

    const [ tooltips, setTooltips ] = useState(true);

    const latestState = stateHistory.at(-1);
    if (!latestState) return <Alert color="red">
        Internal board error.
    </Alert>;

    const getOpinions = async (move?: NormalMove) => {
        const response = await fetch("/api/opinions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                position: makeFen(latestState.position.toSetup()),
                move: move,
                pieces: latestState.llms
            })
        });
    };

    return <div className={styles.wrapper}>
        <span className={styles.title}>
            AI Piece Chess
        </span>

        <Board
            onMovePlayed={getOpinions}
            state={latestState}
            pushState={setStateHistory.append}
            options={{ llmTooltips: tooltips }}
        />

        <span style={{ color: "white" }}>
            It is currently {latestState.position.turn} to move.
        </span>

        <Group>
            <Button onClick={() => getOpinions()}>
                Get AI Opinions
            </Button>

            <Button color="red" onClick={() => {
                const lastBoardState = stateHistory.at(-2);
                if (!lastBoardState) return;

                setStateHistory.pop();
            }}>
                Undo Move
            </Button>

            <Button color="red" onClick={() => {
                setStateHistory.setState([defaultState()]);
            }}>
                Reset Game
            </Button>
        </Group>

        <Stack style={{ color: "white" }}>
            <Switch
                label="LLM Tooltips"
                checked={tooltips}
                onChange={ev => setTooltips(ev.target.checked)}
            />
        </Stack>
    </div>;
}

export function HydrateFallback() {
    return <Center h="100vh">
        <Loader/>
    </Center>;
}

export default Home;