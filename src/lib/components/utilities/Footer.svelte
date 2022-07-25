<script>
  import CitySvg from "./CitySvg.svelte";
  import Container from "./Container.svelte";
  import Logo from "./Logo.svelte";
</script>

<footer>
  <CitySvg />
  <div>
    <Container width="medium">
      <div class="flex-container">
        <p>{new Date().getFullYear()}. All rights reserved.</p>
        <a sveltekit:prefetch href="/">
          <Logo />
        </a>
        <p>
          Created by <a href="https://discord.gg/emeraldcity" target="_blank"
            >Emerald City DAO</a>
        </p>
      </div>
    </Container>
  </div>
</footer>

<style>
  footer {
    padding: 0;
    /* background-color: black; */
  }

  a,
  p {
    font-size: 17px;
  }

  a {
    color: rgb(84, 230, 174);
    text-decoration: none;
  }

  div {
    background-color: var(white);
  }

  .flex-container {
    display: flex;
    flex-direction: column-reverse;
    justify-content: space-between;
    align-items: center;
    gap: 2em;
    height: 100px;
    padding: 0px 20px;
  }

  p {
    margin: 0;
    color: white;
  }

  @media (min-width: 50em) {
    .flex-container {
      flex-direction: row;
    }
  }

  @media all and (max-width: 1000px) {
    a,
    p {
      font-size: 12px;
    }
  }
</style>
