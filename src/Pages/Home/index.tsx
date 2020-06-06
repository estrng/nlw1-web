import React from "react";
import { FiLogIn } from "react-icons/fi";
import { Link } from "react-router-dom"; // SPA Para poder funcionar SPA

import "./styles.css";

import logo from "../../assets/logo.svg";

const Home = () => {
  return (
    <div id="page-home">
      <div className="content">
        <header>
          <img src={logo} alt="Ecoleta" />
        </header>

        <main>
          <h1>Seu lugar de coleta de resíduos</h1>
          <p>Ajudamos você a achar lugares para coleta de resíduos.</p>
          <Link to="/cadastro">
            <span>
              <FiLogIn />
            </span>
            <strong>Registre um ponto de coleta.</strong>
          </Link>
        </main>
      </div>
    </div>
  );
};

export default Home;
