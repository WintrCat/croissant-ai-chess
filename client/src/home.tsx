import { Button, Group } from "@mantine/core";
import { Chessboard } from "react-chessboard";

import styles from "./home.module.css";

function Home() {
    return <div className={styles.wrapper}>
        <span className={styles.title}>
            AI Piece Chess
        </span>

        <Chessboard options={{
            boardStyle: { width: "min(700px, 100%)" }
        }}/>

        <Group>
            <Button>
                Start Game
            </Button>

            <Button color="red">
                Undo Move
            </Button>
        </Group>
    </div>;
}

export default Home;