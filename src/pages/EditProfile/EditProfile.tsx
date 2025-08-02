import React, { FC, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserCourses } from "src/entities/course/model/useUserCourses";
import {
  updateUserProfile,
  updateContactData,
} from "src/entities/user/model/fetchUpdateUser";
import handleBioChangeMinus from "src/features/bio-change/handleBioChangeMinus";
import { filterOptions } from "src/features/filterOptions";
import { fetchSubjects } from "src/features/get-subjects/model/fetchWorkTypes";
import { fetchUniversities } from "src/features/get-universities/model/fetchUniversities";
import { fetchWorkTypes } from "src/features/get-work-types/model/fetchWorkTypes";
import { useUserProfile } from "src/pages/UserProfile/model/useUserProfile";
import MainButton from "src/shared/components/MainButton/MainButton";
import VerificationInput from "src/shared/components/VerificationInput/VerificationInput";
import MarkedExist from "../../shared/assets/profile/MarkedExist.svg";
import CloseImg from "../../shared/assets/wallet/CloseImg.svg";
// import SearchIcon from "src/shared/assets/edit-profile/search-icon.svg";
import Bell from "src/shared/assets/profile/Bell.svg";
import Error from "src/shared/assets/profile/Error.svg";
import Bulb from "src/shared/assets/profile/Bulb.svg";
import Faq from "src/shared/assets/profile/Faq.svg";
import Warning from "src/shared/assets/profile/Warning.svg";
import styles from "./EditProfile.module.css";
import InputWithVariants from "./ui/InputWithVariants/InputWithVariants";
import LinksFAQ from "./ui/LinksFAQ/LinksFAQ";

const EditProfile: FC = () => {
  const { userData, selectedOptionsProfile, uniValueProfile, contactData } =
    useUserProfile();

  const [optionsSubject, setOptionsSubject] = useState<string[]>([]);
  const [optionsUniv, setOptionsUniv] = useState<string[]>([]);
  const [optionsWorkTypes, setOptionsWorkTypes] = useState<string[]>([]);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const subjects = await fetchSubjects();
        setOptionsSubject(subjects);
      } catch (error) {
        console.log("Не удалось загрузить список предметов");
      }
    };

    loadSubjects();
  }, []);

  useEffect(() => {
    const loadUniversities = async () => {
      try {
        const universities = await fetchUniversities();
        setOptionsUniv(universities);
      } catch (error) {
        console.log("Не удалось загрузить список университетов");
      }
    };

    loadUniversities();
  }, []);

  useEffect(() => {
    const loadWorkTypes = async () => {
      try {
        const workTypes = await fetchWorkTypes();
        setOptionsWorkTypes(workTypes);
      } catch (error) {
        console.log("Не удалось загрузить список типов работ");
      }
    };

    loadWorkTypes();
  }, []);

  const userCourses = useUserCourses(window.Telegram.WebApp.initData);
  console.log("selectedOptionsProfile", selectedOptionsProfile);

  const navigate = useNavigate();

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<string[]>([]);
  const [uniValue, setUniValue] = useState("");
  const [bioValue, setBioValue] = useState("");
  const [isNotify, setIsNotify] = useState(true);
  const [boxIsVisibleSubject, setBoxIsVisibleSubject] = useState(false);
  const [boxIsVisibleUniv, setBoxIsVisibleUniv] = useState(false);
  const [boxIsVisibleWorkTypes, setBoxIsVisibleWorkTypes] = useState(false);
  const [inputValueSubject, setInputValueSubject] = useState("");
  const [inputValueUniv, setInputValueUniv] = useState("");
  const [inputValueWorkTypes, setInputValueWorkTypes] = useState("");

  const BackButton = window.Telegram.WebApp.BackButton;
  BackButton.show();
  BackButton.onClick(function () {
    BackButton.hide();
  });
  window.Telegram.WebApp.onEvent("backButtonClicked", function () {
    window.history.back();
  });

  useEffect(() => {
    if (userCourses) {
      try {
        setIsNotify(userCourses.notify || false);
      } catch (error) {
        console.error("Ошибка при запросе к серверу:", error);
      }
    } else {
      console.log("No user data found.");
    }
  }, [userCourses]);

  const handleNotify = () => {
    console.log("handleNotify вызван!");
    setIsNotify((prev) => !prev);
  };
  useEffect(() => {
    console.log("isNotify изменился:", isNotify);
  }, [isNotify]);

  useEffect(() => {
    if (userData?.description) {
      setBioValue(userData.description);
    }
  }, [userData]);

  console.log(boxIsVisibleUniv);

  useEffect(() => {
    setSelectedOptions(selectedOptionsProfile);
  }, [selectedOptionsProfile]);

  useEffect(() => {
    setSelectedWorkTypes(contactData?.work_types || []);
  }, [contactData?.work_types]);

  useEffect(() => {
    setUniValue(uniValueProfile);
  }, [uniValueProfile]);

  console.log("selectedOptions", selectedOptions);

  const handleRemoveOptionSubject = (optionToRemove: string) => {
    const updatedOptions = selectedOptions.filter(
      (option) => option !== optionToRemove
    );
    setSelectedOptions(updatedOptions);
  };

  const handleSelectChangeSubject = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setInputValueSubject(value);
    setBoxIsVisibleSubject(true);
  };

  const handleOptionClickSubject = (option: string) => {
    if (!selectedOptions.includes(option)) {
      setSelectedOptions([...selectedOptions, option]);
    }
    setInputValueSubject("");
    setBoxIsVisibleSubject(false);
  };

  const handleUniChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValueUniv(value);
    setBoxIsVisibleUniv(true);
  };

  const handleOptionClickUniv = (option: string) => {
    if (uniValue !== option) {
      setUniValue(option);
    }
    setInputValueUniv("");
    setBoxIsVisibleUniv(false);
  };
  const handleRemoveOptionUniv = () => {
    setUniValue("");
  };

  const handleSelectChangeWorkTypes = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setInputValueWorkTypes(value);
    setBoxIsVisibleWorkTypes(true);
  };

  const handleOptionClickWorkType = (option: string) => {
    if (!selectedWorkTypes.includes(option)) {
      setSelectedWorkTypes([...selectedWorkTypes, option]);
    }
    setInputValueWorkTypes("");
    setBoxIsVisibleWorkTypes(false);
  };

  const handleRemoveOptionWorkType = (optionToRemove: string) => {
    const updatedOptions = selectedWorkTypes.filter(
      (option) => option !== optionToRemove
    );
    setSelectedWorkTypes(updatedOptions);
  };

  const filteredOptionsSubject = filterOptions(
    optionsSubject,
    inputValueSubject
  );

  const filteredOptionsUniv = filterOptions(optionsUniv, inputValueUniv);

  const filteredOptionsWorkTypes = filterOptions(
    optionsWorkTypes,
    inputValueWorkTypes
  );

  const handleSave = async () => {
    console.log("EditProfile handleSave:", {
      selectedOptions,
      selectedWorkTypes,
      initData: window.Telegram.WebApp.initData ? "present" : "missing",
      userId: userData?.id || 0,
      userData,
      bioValue,
      uniValue,
      isNotify,
    });

    try {
      // 1. Обновляем данные пользователя (университет, описание, уведомления)
      if (userData?.id) {
        await updateUserProfile(userData.id, uniValue, bioValue, isNotify);
        console.log("User profile updated successfully");
      }

      // 2. Обновляем контактные данные (subjects, work_types) через updateContactData
      if (contactData?.id) {
        await updateContactData(
          contactData.id,
          selectedOptions,
          selectedWorkTypes,
          window.Telegram.WebApp.initData
        );
        console.log("Contact data updated successfully");
      }

      console.log("EditProfile data sent successfully");
      navigate(`/profile`);
    } catch (error) {
      console.error("Error updating profile:", error);
      // Показываем пользователю, что произошла ошибка
      // window.Telegram.WebApp.showAlert("Произошла ошибка при сохранении. Попробуйте еще раз.");
    }
  };

  const varsSubject = filteredOptionsSubject.map(
    (item: string, index: number) => {
      const isSelected = selectedOptions.includes(item);

      return (
        <div
          className={styles["edit-profile__ubject-variant"]}
          key={index}
          onClick={() => handleOptionClickSubject(item)}
        >
          <p className={styles["edit-profile__ubject-variant-text"]}>{item}</p>
          {isSelected && (
            <img
              src={MarkedExist}
              alt="Уже выбранный предмет"
              className={styles["edit-profile__ubject-variant-img"]}
            />
          )}
        </div>
      );
    }
  );
  const varsUniv = filteredOptionsUniv.map((item: string, index: number) => {
    const isSelected = selectedOptions.includes(item);

    return (
      <div
        className={styles["edit-profile__ubject-variant"]}
        key={index}
        onClick={() => handleOptionClickUniv(item)}
      >
        <p className={styles["edit-profile__ubject-variant-text"]}>{item}</p>
        {isSelected && (
          <img
            src={MarkedExist}
            alt="Уже выбранный университет"
            className={styles["edit-profile__ubject-variant-img"]}
          />
        )}
      </div>
    );
  });

  const varsWorkTypes = filteredOptionsWorkTypes.map(
    (item: string, index: number) => {
      const isSelected = selectedWorkTypes.includes(item);

      return (
        <div
          className={styles["edit-profile__ubject-variant"]}
          key={index}
          onClick={() => handleOptionClickWorkType(item)}
        >
          <p className={styles["edit-profile__ubject-variant-text"]}>{item}</p>
          {isSelected && (
            <img
              src={MarkedExist}
              alt="Уже выбранный тип работы"
              className={styles["edit-profile__ubject-variant-img"]}
            />
          )}
        </div>
      );
    }
  );

  const handleBioChangeWrapper = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    handleBioChangeMinus(e, setBioValue);
  };
  console.log("Передача в LinksFAQ:", handleNotify);

  return (
    <div className={styles["edit-profile"]}>
      <div className={styles["edit-profile__details"]}>
        <h2 className={styles["edit-profile__title"]}>Детали профиля</h2>

        <div
          className={styles["edit-profile__avatar"]}
          style={{
            backgroundImage: `url(${contactData?.image_url})`,
          }}
        />

        <p className={styles["edit-profile__name"]}>
          {userData?.first_name} {userData?.last_name}
        </p>
      </div>

      <div className={styles["edit-profile__sections"]}>
        <div className={styles["edit-profile__section"]}>
          <h3 className={styles["edit-profile__subtitle"]}>Университет</h3>
          <InputWithVariants
            text="Выбери университет"
            inputValueSubjectComponent={inputValueUniv}
            onClickImg={() => setBoxIsVisibleUniv(false)}
            onChange={handleUniChange}
            isValue={boxIsVisibleUniv ? true : false}
            onClick={() => {
              setBoxIsVisibleUniv(true);
              setBoxIsVisibleSubject(false);
              setBoxIsVisibleWorkTypes(false);
            }}
          >
            {uniValue ? (
              <div className={styles["edit-profile__exist-subject"]}>
                <p className={styles["edit-profile__exist-subject-text"]}>
                  {uniValue}
                </p>
                <button
                  className={styles["edit-profile__exist-subject-button"]}
                  onClick={() => handleRemoveOptionUniv()}
                >
                  <img
                    src={CloseImg}
                    alt="Удалить предмет"
                    className={styles["edit-profile__exist-subject-img"]}
                  />
                </button>
              </div>
            ) : (
              <></>
            )}
          </InputWithVariants>
          {boxIsVisibleUniv ? (
            <div className={styles["edit-profile__all-subjects"]}>
              {varsUniv.map((item, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <div
                      className={styles["edit-course__all-subjects-divider"]}
                    />
                  )}
                  {item}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <></>
          )}
        </div>

        <div className={styles["edit-profile__section"]}>
          <h3 className={styles["edit-profile__subtitle"]}>Предмет</h3>
          <InputWithVariants
            text="Выбери предмет"
            inputValueSubjectComponent={inputValueSubject}
            onClickImg={() => setBoxIsVisibleSubject(false)}
            onChange={handleSelectChangeSubject}
            isValue={boxIsVisibleSubject ? true : false}
            onClick={() => {
              setBoxIsVisibleSubject(true);
              setBoxIsVisibleUniv(false);
              setBoxIsVisibleWorkTypes(false);
            }}
          >
            {selectedOptions ? (
              selectedOptions.map((option) => (
                <div
                  className={styles["edit-profile__exist-subject"]}
                  key={option}
                >
                  <p className={styles["edit-profile__exist-subject-text"]}>
                    {option}
                  </p>
                  <button
                    className={styles["edit-profile__exist-subject-button"]}
                    onClick={() => handleRemoveOptionSubject(option)}
                  >
                    <img
                      src={CloseImg}
                      alt="Удалить предмет"
                      className={styles["edit-profile__exist-subject-img"]}
                    />
                  </button>
                </div>
              ))
            ) : (
              <></>
            )}
          </InputWithVariants>
          {boxIsVisibleSubject ? (
            <div className={styles["edit-profile__all-subjects"]}>
              {varsSubject.map((item, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <div
                      className={styles["edit-course__all-subjects-divider"]}
                    />
                  )}
                  {item}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <></>
          )}
        </div>

        <div className={styles["edit-profile__section"]}>
          <h3 className={styles["edit-profile__subtitle"]}>Типы работ</h3>
          <InputWithVariants
            text="Выбери типы работ"
            inputValueSubjectComponent={inputValueWorkTypes}
            onClickImg={() => setBoxIsVisibleWorkTypes(false)}
            onChange={handleSelectChangeWorkTypes}
            isValue={boxIsVisibleWorkTypes ? true : false}
            onClick={() => {
              setBoxIsVisibleWorkTypes(true);
              setBoxIsVisibleSubject(false);
              setBoxIsVisibleUniv(false);
            }}
          >
            {selectedWorkTypes ? (
              selectedWorkTypes.map((option) => (
                <div
                  className={styles["edit-profile__exist-subject"]}
                  key={option}
                >
                  <p className={styles["edit-profile__exist-subject-text"]}>
                    {option}
                  </p>
                  <button
                    className={styles["edit-profile__exist-subject-button"]}
                    onClick={() => handleRemoveOptionWorkType(option)}
                  >
                    <img
                      src={CloseImg}
                      alt="Удалить тип работы"
                      className={styles["edit-profile__exist-subject-img"]}
                    />
                  </button>
                </div>
              ))
            ) : (
              <></>
            )}
          </InputWithVariants>
          {boxIsVisibleWorkTypes ? (
            <div className={styles["edit-profile__all-subjects"]}>
              {varsWorkTypes.map((item, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <div
                      className={styles["edit-course__all-subjects-divider"]}
                    />
                  )}
                  {item}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <></>
          )}
        </div>

        <div className={styles["edit-profile__section"]}>
          <h3 className={styles["edit-profile__subtitle"]}>Описание</h3>
          <VerificationInput
            placeholder="Расскажи о себе"
            inputFunction={handleBioChangeWrapper}
            inputName="Desc"
            inputValue={bioValue}
            className={styles["edit-profile__section-input"]}
          />
        </div>

        <div className={styles["edit-profile__section"]}>
          <h3 className={styles["edit-profile__subtitle"]}>Курсы</h3>
          <LinksFAQ
            isSubmit={false}
            path={Bell}
            isNotify={isNotify}
            isNotifyFAQ={() => setIsNotify((prev) => !prev)}
            text="Получай уведомления о новых курсах наших преподавателей"
          />
        </div>

        <div className={styles["edit-profile__section"]}>
          <h3 className={styles["edit-profile__subtitle"]}>Обратная связь</h3>
          <Link
            to="https://forms.gle/x9KbBitA1AGDPmXY8"
            target="_blank"
            onClick={(event) => {
              event.preventDefault();
              window.open("https://forms.gle/x9KbBitA1AGDPmXY8");
            }}
          >
            <LinksFAQ
              isSubmit={true}
              path={Error}
              isNotify={isNotify}
              text="Сообщить о баге"
            />
          </Link>
          <Link
            to="https://forms.gle/NtaWQe2wuiRpcY2L8"
            target="_blank"
            onClick={(event) => {
              event.preventDefault();
              window.open("https://forms.gle/NtaWQe2wuiRpcY2L8");
            }}
          >
            <LinksFAQ
              isSubmit={true}
              path={Bulb}
              isNotify={isNotify}
              text="Предложить идею"
            />
          </Link>
          <Link
            to="https://common-course-1.gitbook.io/common-course-app/"
            target="_blank"
            onClick={(event) => {
              event.preventDefault();
              window.open(
                "https://common-course-1.gitbook.io/common-course-app/"
              );
            }}
          >
            <LinksFAQ
              isSubmit={true}
              path={Faq}
              isNotify={isNotify}
              text="Ответы на вопросы"
            />
          </Link>
        </div>

        <div className={styles["edit-profile__section"]}>
          <h3 className={styles["edit-profile__subtitle"]}>О приложении</h3>
          <Link to="/legal">
            <LinksFAQ
              isSubmit={true}
              path={Warning}
              isNotify={isNotify}
              text="Правовая информация"
            />
          </Link>
        </div>
      </div>

      <MainButton text="Сохранить" onClickEvent={() => handleSave()} />
    </div>
  );
};

export default EditProfile;
