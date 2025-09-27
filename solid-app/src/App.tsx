import { destructure } from '@solid-primitives/destructure';
import { For, createEffect, createSignal, onCleanup } from 'solid-js'
import { createStore } from 'solid-js/store';
import type { JSX } from 'solid-js'
import './App.css'

/**
 * Helper methods
 */

const newGrid = (rows: number, cols: number) => Array.from({ length: rows }, () => Array(cols).fill(0));

/**
 * DataTable component
 */

type DataTableProps = {
  rows: number
  cols: number
  freq: number
}

const DataTable = (props: DataTableProps) => {
  const { rows, cols, freq } = destructure(props)

  // Per-cell reactive store
  const [data, setData] = createStore<number[][]>(newGrid(rows(), cols()))

  // Re-shape grid on rols/cols change
  createEffect(() => {
    setData(newGrid(rows(), cols()))
  })

  // Ticker
  createEffect(() => {
    const rowsVal = rows();
    const colsVal = cols();
    const freqVal = freq();

    if (rowsVal <= 0 || colsVal <= 0 || freqVal <= 0) return

    let rev = 1;

    const id = setInterval(() => {
      for (let j = 0; j < colsVal; j++) {
        const i = Math.floor(Math.random() * rowsVal);
        setData(i, j, rev);
      }
      rev += 1
    }, 1000 / freqVal)

    onCleanup(() => clearInterval(id))
  })

  return (
    <table>
      <tbody>
        <For each={data}>
          {(row) => (
            <tr>
              <For each={row}>
                {(cell) => (
                  <td>{cell}</td>
                )}
              </For>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  )
}

/**
 * Display FPS component
 */

const DisplayFPS = () => {
  const [fps, setFps] = createSignal(0);

  createEffect(() => {
    let last = 0;
    let frames = 0;
    let rafId: number;

    const loop = (time: number) => {
      if (!last) last = time;
      frames++;

      const elapsed = time - last;
      if (elapsed >= 1000) {
        setFps(Math.round((frames * 1000) / elapsed)); // frames per second
        frames = 0;
        last = time;
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    onCleanup(() => cancelAnimationFrame(rafId));
  })

  return <span>{fps()}</span>;
}

/**
 * App component
 */

function App() {
  const [rows, setRows] = createSignal(10)
  const [cols, setCols] = createSignal(3)
  const [freq, setFreq] = createSignal(1.0)

  const handleChangeRows: JSX.ChangeEventHandler<HTMLInputElement, Event> = (e) => {
    const next = e.currentTarget.value
    setRows(parseInt(next, 10))
  };

  const handleChangeCols: JSX.ChangeEventHandler<HTMLInputElement, Event> = (e) => {
    const next = e.currentTarget.value
    setCols(parseInt(next, 10))
  };

  const handleChangeFreq: JSX.ChangeEventHandler<HTMLInputElement, Event> = (e) => {
    const next = e.currentTarget.value
    setFreq(parseFloat(next))
  };

  return (
    <main>
      <div>
        FPS: <DisplayFPS />
      </div>
      <ul>
        <li>
          <label>Rows:</label>
          <input type="number" value={rows()} onChange={handleChangeRows} />
        </li>
        <li>
          <label>Data Columns:</label>
          <input type="number" value={cols()} onChange={handleChangeCols} />
        </li>
        <li>
          <label>Update frequency (hz):</label>
          <input type="number" value={freq()} onChange={handleChangeFreq} />
        </li>
      </ul>
      <DataTable rows={rows()} cols={cols()} freq={freq()} />
    </main>
  )
}

export default App
