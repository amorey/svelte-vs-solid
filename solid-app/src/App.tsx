import { createEffect, createSignal, onCleanup } from 'solid-js'
import type { JSX } from 'solid-js'
import './App.css'

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
  const [cols, setCols] = createSignal(1)
  const [freq, setFreq] = createSignal(0.1)

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
      {rows()}
      {cols()}
      {freq()}
    </main>
  )
}

export default App
