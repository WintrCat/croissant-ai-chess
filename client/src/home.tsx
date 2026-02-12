import { Route } from "./+types/home";

import { useMemo, useRef, useState } from "react";
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
import { Chess, makeSquare, NormalMove } from "chessops";
import { makeFen } from "chessops/fen";
import { capitalize } from "es-toolkit";

import { Opinion } from "./types/Opinion";
import { BoardState } from "./types/BoardState";
import { generateDefaultPieces, LLMS } from "./constants/llms";
import { playFullAudio } from "./lib/sounds";
import Board from "./components/Board";
import styles from "./home.module.css";

export function clientLoader() {
    return (): BoardState => ({
        position: Chess.default(),
        llms: generateDefaultPieces()
    });
}

function Home({ loaderData: defaultState }: Route.ComponentProps) {
    const [ stateHistory, setStateHistory ] = useListState([defaultState()]);

    const [ opinion, setOpinion ] = useState<Opinion>();
    const [ opinionPending, setOpinionPending ] = useState(false);

    const [ tooltips, setTooltips ] = useState(true);

    const opinionsController = useRef<AbortController>(null);

    const latestState = useMemo(() => stateHistory.at(-1), [stateHistory]);
    if (!latestState) return <Alert color="red">
        Internal board error.
    </Alert>;

    const opinionModel = useMemo(() => {
        if (!opinion) return;
        return latestState.llms[makeSquare(opinion.square)];
    }, [opinion]);

    const getOpinions = async (move?: NormalMove) => {
        setOpinionPending(true);

        const response = await fetch("/api/opinions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                position: makeFen(latestState.position.toSetup()),
                move: move,
                pieces: latestState.llms
            })
        }).finally(() => setOpinionPending(false));

        const opinions = await response.json() as Opinion[];
        opinionsController.current = new AbortController();

        for (const opinion of opinions) {
            setOpinion(opinion);
            //await playFullAudio(opinion.audio, opinionsController.current);

            if (opinionsController.current.signal.aborted) break;
        }

        opinionsController.current = null;
    };

    return <div className={styles.wrapper}>
        <span className={styles.title}>
            AI Piece Chess
        </span>

        <Board
            state={latestState}
            pushState={setStateHistory.append}
            options={{ llmTooltips: tooltips }}
        />

        <Stack className={styles.informationArea}>
            {!opinionPending && <span>
                It is currently {latestState.position.turn} to move.
            </span>}

            {opinionPending && <span>
                Prompting AIs for responses and generating speech,
                please wait...    
            </span>}

            {opinion && opinionModel && <span>
                <b>
                    {LLMS[opinionModel].name + " "}
                    ({capitalize(opinion.role)} on{" "}
                    {makeSquare(opinion.square)})
                    {" "}says:{" "}
                </b>
                
                {opinion.message}
            </span>}
        </Stack>

        <Group justify="center">
            <Button onClick={() => getOpinions()} loading={opinionPending}>
                Get AI Opinions
            </Button>

            <Button disabled={!opinionsController.current} onClick={
                () => opinionsController.current?.abort()
            }>
                Cancel AI Opinions
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