import { useState, useEffect } from "react";
import GameList from "./components/GameList";
import GameForm from "./components/GameForm";
import GameDetail from "./components/GameDetail";
import "./App.css";

function App() {
  const [currentView, setCurrentView] = useState("list"); // 'list', 'detail', 'create', 'edit'
  const [selectedGame, setSelectedGame] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSelectGame = (game) => {
    setSelectedGame(game);
    setCurrentView("detail");
  };

  const handleCreateGame = () => {
    setSelectedGame(null);
    setCurrentView("create");
  };

  const handleEditGame = (game) => {
    setSelectedGame(game);
    setCurrentView("edit");
  };

  const handleSaveGame = () => {
    setCurrentView("list");
    setSelectedGame(null);
    setRefreshTrigger((prev) => prev + 1); // Trigger refresh of game list
  };

  const handleCancel = () => {
    setCurrentView("list");
    setSelectedGame(null);
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedGame(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎮 Game Reviews App</h1>
        <p>Discover, review, and rate your favorite games</p>
      </header>

      <main className="app-main">
        {currentView === "list" && (
          <GameList
            key={refreshTrigger} // Force re-render when refreshTrigger changes
            onSelectGame={handleSelectGame}
            onCreateGame={handleCreateGame}
          />
        )}

        {currentView === "detail" && (
          <GameDetail
            game={selectedGame}
            onBack={handleBackToList}
            onEdit={handleEditGame}
          />
        )}

        {(currentView === "create" || currentView === "edit") && (
          <GameForm
            game={currentView === "edit" ? selectedGame : null}
            onSave={handleSaveGame}
            onCancel={handleCancel}
          />
        )}
      </main>
    </div>
  );
}

export default App;
