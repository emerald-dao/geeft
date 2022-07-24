<script>
  import { createGeeft } from "../../flow/actions";

  import { message, recipient } from "$lib/stores/CreationStore.js";
</script>

<div>
  <h2>3. Send Geeft</h2>
</div>
<article>
  <label for="message">Send a message</label>
  <textarea
    class="message"
    id="message"
    placeholder="This is for my lovely friend Jacob Tucker..."
    bind:value={$message} />

  <label for="recipient">Recipient</label>
  <input
    class="recipient"
    id="recipient"
    placeholder="0x5643fd47a29770e7"
    bind:value={$recipient} />
  <button on:click={createGeeft}>Send</button>
</article>

<style>
  div {
    position: relative;
    margin-top: 20px;
    border-radius: 5px;
    box-shadow: #0000003d 0 3px 8px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgb(84, 230, 174);
    padding: 20px;
  }

  button {
    border: 0;
    background-color: black;
    padding: 10px;
    border-radius: 10px;
    color: rgb(181, 225, 208);
    font-size: 15px;
    width: 100px;
  }

  button:hover {
    cursor: pointer;
  }

  label {
    font-size: 18px;
  }

  article {
    position: relative;
    display: flex;
    flex-direction: column;
    background: rgb(181, 225, 208);
    padding: 20px;
  }

  article > * {
    margin: 5px;
  }

  textarea,
  input {
    position: relative;
    font-size: 16px;
    border-radius: 5px;
    border: 1px solid rgb(84, 230, 174);
    padding: 5px;
  }

  input {
    width: 200px;
  }
</style>
