import { FC, useEffect } from "react";
import PaymentLimits from "src/features/PaymentLimits/PaymentLimits";
import LinksFAQ from "src/pages/EditProfile/ui/LinksFAQ/LinksFAQ";
import creditCardSolid from "src/shared/assets/profile/credit-card-solid.svg";
import NavBar from "src/shared/components/NavBar/NavBar";
import { UserAvatar } from "src/shared/components/UserAvatar/UserAvatar";
import { UserName } from "src/shared/components/UserName/UserName";
import { useTelegramUserData } from "src/hooks/useTelegramUserData";
import { useUserProfile } from "../model/useUserProfile";
import styles from "./UserProfile.module.css";
import MyDataCard from "src/shared/components/MyDataCard/MyDataCard";

const UserProfile: FC = () => {
  window.scrollTo(0, 0);
  const { id } = window.Telegram.WebApp.initDataUnsafe.user;

  const BackButton = window.Telegram.WebApp.BackButton;
  BackButton.show();
  BackButton.onClick(function () {
    BackButton.hide();
  });
  window.Telegram.WebApp.onEvent("backButtonClicked", function () {
    window.history.back();
  });

  const { userData, contactData } = useUserProfile();
  const { data: telegramUser } = useTelegramUserData();

  console.log("userData:", userData);
  console.log("contactData:", contactData);
  console.log("contactData.is_visible:", contactData?.is_visible);
  console.log("telegramUser:", telegramUser);

  useEffect(() => {
    const fetchData = async () => {
      // const result = await fetchUserTransactions(id);
      // if (result) {
      //   setVerifyed(result.verifyed);
      // }
    };
    fetchData();
  }, [id]);

  return (
    <div className={styles["user-profile"]}>
      <h2 className={styles["user-profile__title"]}>Профиль</h2>

      <div className={styles["user-profile__user-info"]}>
        <UserAvatar size="medium" />

        <div className={styles["user-profile__user-details"]}>
          <h2 className={styles["user-profile__username"]}>
            <UserName showAt={true} />
          </h2>
          <p className={styles["user-profile__status"]}>Junior</p>
        </div>
      </div>

      <PaymentLimits />

      <div className={styles["user-profile__wrapper-cards"]}>
        <MyDataCard
          title="Пройдите KYC-верификацию"
          description="Пройди верификацию, чтобы получить доступ к расширенному функционалу"
          verifyed="На модерации"
          path="/"
        />
        <LinksFAQ
          isSubmit={true}
          path={creditCardSolid}
          text="Реферальная программа"
        />
      </div>

      <div className={styles["user-profile__wrapper-cards"]}>
        <LinksFAQ isSubmit={true} path={creditCardSolid} text="Безопасность" />
        <LinksFAQ isSubmit={true} path={creditCardSolid} text="Язык" />
      </div>

      <div className={styles["user-profile__wrapper-cards"]}>
        <LinksFAQ isSubmit={true} path={creditCardSolid} text="Telegram" />
        <LinksFAQ isSubmit={true} path={creditCardSolid} text="FAQ" />
        <LinksFAQ isSubmit={true} path={creditCardSolid} text="Документация" />
        <LinksFAQ isSubmit={true} path={creditCardSolid} text="Поддержка" />
      </div>

      <NavBar />
    </div>
  );
};

export default UserProfile;
