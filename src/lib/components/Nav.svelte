<script>
  import { user } from "../../flow/stores.js";
  import { authenticate } from "../../flow/actions.js";
</script>

<nav>
  <div>
    <img src="/gift.png" alt="emerald gift icon" />
    <a href="/"><h1>Geeft</h1></a>
  </div>

  <div>
    <a href="/me">View My Geefts</a>
    <button on:click={authenticate}>
      {$user.loggedIn ? $user.addr : "Connect Wallet"}
    </button>
  </div>
</nav>

<style>
  div {
    display: flex;
    justify-content: center;
    align-items: center;
    color: rgb(84, 230, 174);
    font-size: 30px;
  }
  a {
    text-decoration: none;
    font-size: 18px;
    margin-right: 10px;
    color: rgb(84, 230, 174);
  }
  h1 {
    font-size: 40px;
    font-family: Century Gothic, sans-serif;
  }
  button {
    padding: 10px;
    background-color: rgb(84, 230, 174);
    border: none;
    border-radius: 5px;
    color: white;
    font-size: 20px;
    box-shadow: #0000003d 0 3px 8px;
    cursor: pointer;
  }
  img {
    width: 75px;
    height: 75px;
  }
  nav {
    width: 80vw;
    padding: 50px 10vw 0px 10vw;
    display: flex;
    justify-content: space-around;
    align-items: center;
  }

  @media all and (max-width: 1000px) {
    nav {
      flex-direction: column;
    }
  }
</style>
