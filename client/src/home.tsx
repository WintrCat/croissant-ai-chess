import { Route } from "./+types/home";

import { useMemo, useState } from "react";
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
import { makeSan } from "chessops/san";
import { capitalize } from "es-toolkit";

import { Opinion } from "./types/Opinion";
import { BoardState } from "./types/BoardState";
import { generateDefaultPieces, LLMS } from "./constants/llms";
import { playFullAudio } from "./lib/sounds";
import Board from "./components/Board";
import styles from "./home.module.css";

type OpinionStatus = "all" | "move" | undefined;

export function clientLoader() {
    return (): BoardState => ({
        position: Chess.default(),
        llms: generateDefaultPieces()
    });
}

function Home({ loaderData: defaultState }: Route.ComponentProps) {
    const [ stateHistory, setStateHistory ] = useListState([defaultState()]);

    const [ opinions, setOpinions ] = useState<Opinion[]>([]);
    const [ currentOpinion, setCurrentOpinion ] = useState<Opinion>();
    const [ opinionPending, setOpinionPending ] = useState<OpinionStatus>();

    const [
        opinionsController,
        setOpinionsController
    ] = useState<AbortController>();

    const [ tooltips, setTooltips ] = useState(true);

    const latestState = useMemo(() => stateHistory.at(-1), [stateHistory]);
    if (!latestState) return <Alert color="red">
        Internal board error.
    </Alert>;

    const currentOpinionModel = useMemo(() => {
        if (!currentOpinion) return;
        return latestState.llms[makeSquare(currentOpinion.square)];
    }, [currentOpinion]);

    const getOpinions = async (move?: NormalMove) => {
        setCurrentOpinion(undefined);
        setOpinionPending(move ? "move" : "all");
        
        const lastPosition = stateHistory.at(-2)?.position;

        const response = await fetch("/api/opinions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                position: makeFen(latestState.position.toSetup()),
                move: move && {
                    parsed: move,
                    san: lastPosition && makeSan(lastPosition, move)
                },
                pieces: latestState.llms
            })
        }).finally(() => setOpinionPending(undefined));

        const opinions = await response.json() as Opinion[];
        setOpinions(opinions);
    };

    const playOpinions = async () => {
        const controller = new AbortController();
        setOpinionsController(controller);

        for (const opinion of opinions) {
            setCurrentOpinion(opinion);
            await playFullAudio(opinion.audio, controller);
            await new Promise(res => setTimeout(res, 1000));

            if (controller.signal.aborted) break;
        }

        setOpinionsController(undefined);
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

            {currentOpinion && currentOpinionModel && <span>
                <b>
                    {LLMS[currentOpinionModel].name + " "}
                    ({capitalize(currentOpinion.role)} on{" "}
                    {makeSquare(currentOpinion.square)})
                    {" "}says:{" "}
                </b>
                
                {currentOpinion.message}
            </span>}
        </Stack>

        <Group justify="center">
            <Button
                loading={opinionPending == "all"}
                onClick={() => getOpinions()}
            >
                Get Opinions
            </Button>

            <Button
                disabled={!latestState.move}
                loading={opinionPending == "move"}
                onClick={() => getOpinions(latestState.move)}
            >
                Get Move Opinion
            </Button>

            <Button
                color={opinionsController ? "red": "blue"}
                disabled={opinions.length == 0}
                onClick={() => opinionsController
                    ? opinionsController.abort()
                    : playOpinions()
                }
            >
                {opinionsController
                    ? "bro stop talking"
                    : "Play Opinions"
                }
            </Button>
        </Group>

        <Group>
            <Button color="red" onClick={() => {
                const lastBoardState = stateHistory.at(-2);
                if (!lastBoardState) return;

                setStateHistory.pop();
            }}>
                Undo Move
            </Button>

            <Button color="red" onClick={() => {
                setStateHistory.setState([defaultState()]);
                setOpinionPending(undefined);
                setCurrentOpinion(undefined);
                setOpinions([]);
                setOpinionsController(undefined);
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