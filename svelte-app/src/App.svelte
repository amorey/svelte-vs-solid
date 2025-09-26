<script lang="ts">
  let rows = $state(10);
  let cols = $state(1);
  let freq = $state(0.1);
</script>

<main>
  <ul>
    <li>
      <label>
        Rows:
        <input type="number" bind:value={rows} />
      </label>
    </li>
    <li>
      <label>
        Data Columns:
        <input type="number" bind:value={cols} />
      </label>
    </li>
    <li>
      <label>
        Update frequency (hz):
        <input type="number" bind:value={freq} />
      </label>
    </li>
  </ul>
  {rows}
  {cols}
  {freq}
</main>
