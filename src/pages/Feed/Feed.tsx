import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../shared/components/NavBar/NavBar";
import styles from "./Feed.module.css";
import FeedFilters from "./ui/FeedFilters";
import FeedHeader from "./ui/FeedHeader";
import FeedList from "./ui/FeedList";
import FeedSearch from "./ui/FeedSearch";
import useUserContactsData from "src/entities/user/model/useUserContacts";
import { useAllUsers } from "src/hooks/useAllUsers";
import { useFeed } from "src/hooks/useFeed";

const Feed = () => {
  const BackButton = window.Telegram.WebApp.BackButton;

  if (BackButton.isVisible) {
    BackButton.hide();
  }

  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("Все контакты");

  const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
  const { userContacts } = useUserContactsData(userId, navigate);
  const { users: allUsers, isLoading: usersLoading } = useAllUsers();

  console.log("userContactsFeed", userContacts);
  console.log("allUsers", allUsers.length);
  console.log("Active filter:", activeFilter);

  const {
    inputValue,
    setInputValue,
    filteredData,
    isPending,
    startTransition,
    error,
  } = useFeed(activeFilter, allUsers, userId);

  console.log(
    "Filtered contacts:",
    filteredData ? filteredData.length : 0,
    "contacts found"
  );
  if (error) {
    console.error("Feed error:", error);
  }

  return (
    <div className={styles["feed"]}>
      <FeedHeader />
      <FeedSearch
        inputValue={inputValue}
        onChange={(e) => startTransition(() => setInputValue(e.target.value))}
      />
      <FeedFilters onFilterChange={setActiveFilter} />
      {error ? (
        <div className={styles["feed__error"]}>
          <p>Ошибка при загрузке контактов. Пожалуйста, попробуйте позже.</p>
        </div>
      ) : (
        <FeedList
          filteredCourses={filteredData}
          isPending={isPending || usersLoading}
        />
      )}
      {/* <Link
        to="/subscription"
        className={styles["feed__link-create-subscription"]}
      >
        <button className={styles["feed__create-subscription"]}>
          Оформить подписку
        </button>
      </Link> */}
      <NavBar />
    </div>
  );
};

export default Feed;
