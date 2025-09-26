import { createSignal } from 'solid-js'
import type { JSX } from 'solid-js'
import './App.css'

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
    <>
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
    </>
  )
}

export default App
