import axios from "axios";
import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const nbaPlayersAPI = axios.create({
    baseURL: "https://nba-players-cc.herokuapp.com/graphql",
  });
  const tableHeaders = ["First Name", "Last Name", "Current Team Name"];
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [refreshPlayers, setRefreshPlayers] = useState(true);
  const firstName = useRef("");
  const lastName = useRef("");
  const teamId = useRef("");

  const GET_PLAYERS = `
    {
      players {
        id
        firstName
        lastName
        currentTeam {
          name
        }
      }
    }
  `;

  const GET_TEAMS = `
    {
      teams {
        id
        name
      }
    }
  `;

  const CREATE_PLAYER = `
    mutation ($data: PlayerCreateInput! ){
      createPlayer(data: $data) {
        id
        firstName
        lastName
        currentTeam {
          id
          name
        }
      }
    }
  `;

  useEffect(() => {
    const getPlayers = async () => {
      const res = await nbaPlayersAPI.post("", { query: GET_PLAYERS });
      if (res && res.data && res.data.data && res.data.data.players) {
        setPlayers(res.data.data.players);
      }
    };

    const getTeams = async () => {
      const res = await nbaPlayersAPI.post("", { query: GET_TEAMS });
      if (res && res.data && res.data.data && res.data.data.teams) {
        setTeams(res.data.data.teams);
      }
    };

    if (refreshPlayers) {
      getPlayers();
      setRefreshPlayers(false);
    }
    getTeams();
  }, [refreshPlayers]);

  const createNewPlayer = async () => {
    await nbaPlayersAPI.post("", {
      query: CREATE_PLAYER,
      variables: {
        data: {
          firstName: firstName.current.value,
          lastName: lastName.current.value,
          currentTeamId: +teamId.current.value,
        },
      },
    });
    firstName.current.value = "";
    lastName.current.value = "";
    teamId.current.value = "";
    setRefreshPlayers(true);
  };

  const createTableHeader = () => {
    return tableHeaders.map((header, index) => {
      return <td key={index}>{header}</td>;
    });
  };

  const createTableBody = () => {
    return players.map((player) => {
      return (
        <tr key={player.id}>
          <td>{player.firstName}</td>
          <td>{player.lastName}</td>
          <td>{player.currentTeam?.name}</td>
        </tr>
      );
    });
  };

  const createTeamsDropdown = () => {
    console.log("teams:", teams);
    return teams.map((team) => {
      return (
        <option key={team.id} value={team.id}>
          {team.name}
        </option>
      );
    });
  };

  return (
    <div className="App">
      <section>
        <h2>NBA Players</h2>
        <table class="player-table">
          <thead>
            <tr>{createTableHeader()}</tr>
          </thead>
          <tbody>{createTableBody()}</tbody>
        </table>
      </section>
      <section>
        <h2>Add New Player</h2>
        <div>
          <div className="form-separator">
            <label htmlFor="firstName">First Name</label>
            <input name="firstName" type="text" ref={firstName} />
          </div>
          <div className="form-separator">
            <label htmlFor="lastName">Last Name</label>
            <input name="lastName" type="text" ref={lastName} />
          </div>
          <div className="form-separator">
            <label htmlFor="team">Team</label>
            <select name="team" ref={teamId}>
              {createTeamsDropdown()}
            </select>
          </div>
          <button type="button" onClick={createNewPlayer}>
            Create New Player
          </button>
        </div>
      </section>
    </div>
  );
}

export default App;
