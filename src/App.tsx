import { useState } from 'react';
import styles from './App.module.css';
import { Header } from './components/Header/Header';
import { LeagueList } from './components/LeagueList/LeagueList';
import { SearchInput } from './components/SearchInput/SearchInput';
import { SportSelect } from './components/SportSelect/SportSelect';
import { StatusMessage } from './components/StatusMessage/StatusMessage';
import { useLeagues } from './hooks/useLeagues';
import { ALL_SPORTS, filterLeagues } from './lib/filterLeagues';
import { getSports } from './lib/getSports';

export function App() {
  const [search, setSearch] = useState('');
  const [sport, setSport] = useState(ALL_SPORTS);
  const [expandedLeagueId, setExpandedLeagueId] = useState<string | null>(null);

  const leaguesQuery = useLeagues();
  const leagues = leaguesQuery.data ?? [];
  const sports = getSports(leagues);
  const visibleLeagues = filterLeagues(leagues, search, sport);

  function toggleLeague(leagueId: string) {
    setExpandedLeagueId((current) => (current === leagueId ? null : leagueId));
  }

  function clearFilters() {
    setSearch('');
    setSport(ALL_SPORTS);
  }

  function renderContent() {
    // isFetching also covers a Retry after an error (data is never refetched otherwise).
    if (leaguesQuery.isPending || leaguesQuery.isFetching) {
      return <StatusMessage variant="loading" message="Loading leagues…" />;
    }
    if (leaguesQuery.isError) {
      return (
        <StatusMessage
          variant="error"
          message="Could not load leagues."
          actionLabel="Retry"
          onAction={() => leaguesQuery.refetch()}
        />
      );
    }
    if (visibleLeagues.length === 0) {
      return (
        <StatusMessage
          variant="empty"
          message="No leagues match your filters."
          actionLabel="Clear filters"
          onAction={clearFilters}
        />
      );
    }
    return (
      <LeagueList
        leagues={visibleLeagues}
        expandedLeagueId={expandedLeagueId}
        onToggleLeague={toggleLeague}
      />
    );
  }

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.filters}>
          <SearchInput value={search} onChange={setSearch} />
          <SportSelect sports={sports} value={sport} onChange={setSport} />
        </div>
        {renderContent()}
      </main>
    </>
  );
}
