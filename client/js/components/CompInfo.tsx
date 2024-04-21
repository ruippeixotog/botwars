import React, { FormEvent } from "react";
import { Row, Col, Button, Table } from "react-bootstrap";
import { FormGroup, InputGroup, ControlLabel, Radio, FormControl } from "react-bootstrap";
import { Link, NavigateFunction, useNavigate, useParams } from "react-router-dom";

import CompsActions from "../actions/CompsActions";
import CompsEvents from "../events/CompsEvents";
import CompsStore from "../stores/CompsStore";
import GamesStore from "../stores/GamesStore";

import GameStatusLabel from "./GameStatusLabel";
import Paths from "../utils/RouterPaths";
import { CompComponentProps, CompInfo as CompInfoType, Game } from "../types";

type CompInfoProps = {
  game: Game,
  compTypes: { [compType: string]: React.ComponentType<CompComponentProps> }
};

type CompInfoLegacyProps = CompInfoProps & {
  compId: string,
  navigate: NavigateFunction
};

type CompInfoLegacyState = {
  compInfo: CompInfoType | Record<string, never>,
  compGames: string[],
  joinMode: JoinMode,
  registering: boolean,
  lastPlayerToken: string | null
};

enum JoinMode {
  WATCH = "WATCH",
  REGISTER_AND_PLAY = "REGISTER_AND_PLAY",
  PLAY = "PLAY"
}

const CompInfo = (props: CompInfoProps): JSX.Element => {
  const { compId } = useParams();
  const navigate = useNavigate();
  return <CompInfoLegacy compId={compId!} navigate={navigate} {...props} />;
};

class CompInfoLegacy extends React.Component<CompInfoLegacyProps, CompInfoLegacyState> {
  private _compPollTimeout: NodeJS.Timeout;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private playerTokenInput: any;

  constructor(props: CompInfoLegacyProps) {
    super(props);
    const compStore = CompsStore.getComp(this.getGame().href, this.getCompId());

    this.state = {
      compInfo: compStore.getInfo(),
      compGames: [],
      joinMode: compStore.getLastToken() ? JoinMode.PLAY : JoinMode.WATCH,
      registering: false,
      lastPlayerToken: compStore.getLastToken()
    };
  }

  getCompId = (): string => {
    return this.props.compId;
  };

  getGame = (): Game => {
    return this.props.game;
  };

  isThisGame = (gameHref: string, compId: string): boolean => {
    return gameHref === this.getGame().href && compId === this.getCompId();
  };

  componentWillMount(): void {
    CompsStore.on(CompsEvents.COMP_INFO, this.onCompInfoUpdate);
    CompsStore.on(CompsEvents.COMP_INFO_ERROR, this.onCompInfoError);
    CompsStore.on(CompsEvents.COMP_GAMES, this.onCompGamesUpdate);
    CompsStore.on(CompsEvents.COMP_GAMES_ERROR, this.onCompGamesError);
    this.retrieveCompInfo();
  }

  componentWillUnmount(): void {
    clearInterval(this._compPollTimeout);
    CompsStore.removeListener(CompsEvents.COMP_INFO, this.onCompInfoUpdate);
    CompsStore.removeListener(CompsEvents.COMP_INFO_ERROR, this.onCompInfoError);
    CompsStore.removeListener(CompsEvents.COMP_GAMES, this.onCompGamesUpdate);
    CompsStore.removeListener(CompsEvents.COMP_GAMES_ERROR, this.onCompGamesError);
    this.removeRegisterListeners();
  }

  onCompInfoUpdate = (gameHref: string, compId: string): void => {
    if (this.isThisGame(gameHref, compId)) {
      this.setState({ compInfo: CompsStore.getComp(gameHref, compId).getInfo() });
    }
  };

  onCompInfoError = (gameHref: string, gameId: string): void => {
    if (this.isThisGame(gameHref, gameId)) {
      // TODO handle error
    }
  };

  onCompGamesUpdate = (gameHref: string, compId: string): void => {
    if (this.isThisGame(gameHref, compId)) {
      const compGameIds = CompsStore.getComp(gameHref, compId).getGames();
      const compGames = compGameIds.map(gameId => {
        const gameStore = GamesStore.getGame(this.getGame().href, gameId);
        return gameStore.getInfo();
      });

      this.setState({ compGames });
    }
  };

  onCompGamesError = (gameHref: string, gameId: string): void => {
    if (this.isThisGame(gameHref, gameId)) {
      // TODO handle error
    }
  };

  retrieveCompInfo = (): void => {
    CompsActions.retrieveCompInfo(this.getGame().href, this.getCompId());
    CompsActions.retrieveCompGames(this.getGame().href, this.getCompId());
    this._compPollTimeout = setTimeout(this.retrieveCompInfo, 5000);
  };

  onRegisterSuccess = (gameHref: string, compId: string, playerToken: string): void => {
    const game = this.props.game;
    const pageCompId = this.props.compId;

    if (gameHref === game.href && compId === pageCompId) {
      const { compInfo, compGames } = this.state;
      // TODO a game may not exist yet and it must be handled properly
      const gameId = compInfo.currentGame || compGames[compGames.length - 1];

      this.props.navigate(Paths.gameStream(gameHref, gameId, { compId, playerToken }));
      this.removeRegisterListeners();
    }
  };

  onRegisterError = (gameHref: string, compId: string): void => {
    const game = this.props.game;
    const pageCompId = this.props.compId;

    if (gameHref === game.href && compId === pageCompId) {
      this.setState({ registering: false });
      this.removeRegisterListeners();
    }
  };

  removeRegisterListeners = (): void => {
    CompsStore.removeListener(CompsEvents.REGISTER_SUCCESS, this.onRegisterSuccess);
    CompsStore.removeListener(CompsEvents.REGISTER_ERROR, this.onRegisterError);
  };

  handleCompFormSubmit = (e: FormEvent<Element>): void => {
    e.preventDefault();
    const game = this.props.game;
    const compId = this.props.compId;
    const { compInfo, compGames } = this.state;
    const gameId = compInfo.currentGame || compGames[compGames.length - 1];

    switch (this.state.joinMode) {
      case JoinMode.WATCH: {
        this.props.navigate(Paths.gameStream(game.href, gameId, { compId }));
        break;
      }
      case JoinMode.REGISTER_AND_PLAY: {
        CompsActions.register(game.href, compId);
        CompsStore.on(CompsEvents.REGISTER_SUCCESS, this.onRegisterSuccess);
        CompsStore.on(CompsEvents.REGISTER_ERROR, this.onRegisterError);
        this.setState({ registering: true });
        break;
      }
      case JoinMode.PLAY: {
        const playerToken = this.playerTokenInput.getValue();
        this.props.navigate(Paths.gameStream(game.href, gameId, { compId, playerToken }));
        break;
      }
    }
  };

  render(): JSX.Element {
    const { game, compTypes } = this.props;
    const { joinMode, registering, compInfo, compGames } = this.state;
    const isGameFull = compInfo.registeredPlayers === compInfo.players;

    const setJoinMode = (joinMode: JoinMode) => () => { this.setState({ joinMode }); };

    const title = compInfo.name || "Competition #" + compInfo.compId;

    let winnerCell = "N/A";
    if (compInfo.winners) {
      switch (compInfo.winners.length) {
        case 0: winnerCell = "Draw"; break;
        case 1: winnerCell = `Player ${compInfo.winners[0]}`; break;
        default: winnerCell = `Players ${compInfo.winners.join(", ")}`;
      }
    }

    let currentGameCell: React.ReactNode = "N/A";
    if (compInfo.currentGame) {
      currentGameCell =
        <Link to={Paths.gameInfo(game.href, compInfo.currentGame)}>{compInfo.currentGame}</Link>;
    }

    const CompComponent = compTypes[compInfo.type];
    const compCol = CompComponent ?
      <Col lg={9}><CompComponent gameHref={game.href} info={compInfo} games={compGames} /></Col> :
      <Col lg={0} />;

    return (
      <div>
        <Row>
          <Col lg={12}>
            <h3>{title}</h3>
          </Col>
        </Row>
        <Row>
          {compCol}
          <Col lg={CompComponent ? 3 : 12}>
            <Table>
              <tbody>
                <tr>
                  <th>Competition ID</th>
                  <td>{compInfo.compId}</td>
                </tr>
                <tr>
                  <th>Name</th>
                  <td>{compInfo.name || "N/A"}</td>
                </tr>
                <tr>
                  <th>Type</th>
                  <td>{compInfo.type}</td>
                </tr>
                <tr>
                  <th>Players</th>
                  <td>{compInfo.registeredPlayers}/{compInfo.players}</td>
                </tr>
                <tr>
                  <th>Status</th>
                  <td><GameStatusLabel status={compInfo.status} /></td>
                </tr>
                <tr>
                  <th>Parameters</th>
                  <td>
                    <pre>
                      {JSON.stringify(compInfo.params, null, 2)}
                    </pre>
                  </td>
                </tr>
                <tr>
                  <th>Current game</th>
                  <td>{currentGameCell}</td>
                </tr>
                <tr>
                  <th>Winners</th>
                  <td>{winnerCell}</td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <form onSubmit={this.handleCompFormSubmit}>
              <FormGroup>
                <InputGroup>
                  <ControlLabel>I want to:</ControlLabel>
                  <Radio disabled={registering}
                    checked={joinMode === JoinMode.WATCH}
                    onChange={setJoinMode(JoinMode.WATCH)}>
                    watch the game as a spectator
                  </Radio>

                  <Radio disabled={registering || isGameFull}
                    checked={joinMode === JoinMode.REGISTER_AND_PLAY}
                    onChange={setJoinMode(JoinMode.REGISTER_AND_PLAY)}>
                    enter the competition as a new player
                  </Radio>

                  <Radio disabled={registering}
                    checked={joinMode === JoinMode.PLAY}
                    onChange={setJoinMode(JoinMode.PLAY)}>
                    play the competition as the player with token
                    <FormControl type="text"
                      ref={elem => { this.playerTokenInput = elem; }}
                      bsSize="small"
                      className="player-token-form-group"
                      disabled={registering || joinMode !== JoinMode.PLAY}
                      placeholder="playerToken"
                      defaultValue={this.state.lastPlayerToken ?? undefined} />
                  </Radio>
                </InputGroup>
              </FormGroup>

              <Button type="submit">Start!</Button>
            </form>
          </Col>
        </Row>
      </div>
    );
  }
}

export default CompInfo;
