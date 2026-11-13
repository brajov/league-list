import { useRef, useState } from 'react';
import styles from './App.module.css';
import { Header } from './components/Header/Header';
import { LeagueList } from './components/LeagueList/LeagueList';
import { Pagination } from './components/Pagination/Pagination';
import { SearchInput } from './components/SearchInput/SearchInput';
import { SportSelect } from './components/SportSelect/SportSelect';
import { StatusMessage } from './components/StatusMessage/StatusMessage';
import { useLeagues } from './hooks/useLeagues';
import { ALL_SPORTS, filterLeagues } from './lib/filterLeagues';
import { getSports } from './lib/getSports';
import { paginate } from './lib/paginate';

// The API has no paging (a premium key returns up to 3000 leagues in one
// response), so the filtered list is paged here.
export const PAGE_SIZE = 15;

export function App() {
  const [search, setSearch] = useState('');
  const [sport, setSport] = useState(ALL_SPORTS);
  const [page, setPage] = useState(1);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [expandedLeagueId, setExpandedLeagueId] = useState<string | null>(null);
  // A league the user closed while it was the only result, so it is not
  // reopened automatically straight away.
  const [dismissedLeagueId, setDismissedLeagueId] = useState<string | null>(null);

  const leaguesQuery = useLeagues();
  const leagues = leaguesQuery.data ?? [];
  const sports = getSports(leagues);
  // The brief asks for the sport filter only when the response has more than one sport.
  const showSportFilter = sports.length > 1;
  const visibleLeagues = filterLeagues(leagues, search, sport);
  const currentPage = paginate(visibleLeagues, page, PAGE_SIZE);

  // A single result is opened automatically: there is nothing else to choose.
  // The user can still close it.
  const singleLeagueId = visibleLeagues.length === 1 ? visibleLeagues[0].idLeague : null;
  const openLeagueId =
    singleLeagueId !== null && singleLeagueId !== dismissedLeagueId
      ? singleLeagueId
      : expandedLeagueId;

  // Toggles what is on screen, so closing an automatically opened league works too.
  function toggleLeague(leagueId: string) {
    const isOpen = leagueId === openLeagueId;
    setExpandedLeagueId(isOpen ? null : leagueId);
    setDismissedLeagueId(isOpen ? leagueId : null);
  }

  // A new filter starts again from the first page.
  function changeSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function changeSport(value: string) {
    setSport(value);
    setPage(1);
  }

  function clearFilters() {
    changeSearch('');
    changeSport(ALL_SPORTS);
  }

  // The controls sit under the list, so bring the top of the new page into view.
  function changePage(nextPage: number) {
    setPage(nextPage);
    headingRef.current?.scrollIntoView?.({ block: 'nearest' });
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
      <>
        <LeagueList
          leagues={currentPage.items}
          expandedLeagueId={openLeagueId}
          onToggleLeague={toggleLeague}
        />
        {currentPage.pageCount > 1 && (
          <Pagination
            page={currentPage.page}
            pageCount={currentPage.pageCount}
            first={currentPage.first}
            last={currentPage.last}
            total={visibleLeagues.length}
            onPageChange={changePage}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Header />
      <main className={styles.main}>
        <section className={styles.panel}>
          <div className={styles.filters}>
            <SearchInput value={search} onChange={changeSearch} />
            {showSportFilter && (
              <SportSelect sports={sports} value={sport} onChange={changeSport} />
            )}
          </div>
          <h2 ref={headingRef} className={styles.sectionHeader}>
            All Leagues
            {leaguesQuery.isSuccess && (
              <span className={styles.count}>({visibleLeagues.length})</span>
            )}
          </h2>
          {renderContent()}
        </section>
      </main>
    </>
  );
}
