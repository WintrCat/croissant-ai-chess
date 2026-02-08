import { Button, Group } from "@mantine/core";

import Board from "./Board";
import styles from "./home.module.css";

function Home() {
    return <div className={styles.wrapper}>
        <span className={styles.title}>
            AI Piece Chess
        </span>

        <Board/>

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