import React, { FC, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  fetchUpdateUser,
  updateUserProfile,
} from "src/entities/user/model/fetchUpdateUser";
import handleBioChangeMinus from "src/features/bio-change/handleBioChangeMinus";
import { filterOptions } from "src/features/filterOptions";
import { fetchSubjects } from "src/features/get-subjects/model/fetchWorkTypes";
import { fetchUniversities } from "src/features/get-universities/model/fetchUniversities";
import { fetchWorkTypes } from "src/features/get-work-types/model/fetchWorkTypes";
import MainButton from "src/shared/components/MainButton/MainButton";
import VerificationInput from "src/shared/components/VerificationInput/VerificationInput";
import Bell from "../../shared/assets/profile/Bell.svg";
import Bulb from "../../shared/assets/profile/Bulb.svg";
import Error from "../../shared/assets/profile/Error.svg";
import Faq from "../../shared/assets/profile/Faq.svg";
import MarkedExist from "../../shared/assets/profile/MarkedExist.svg";
import Warning from "../../shared/assets/profile/Warning.svg";
import CloseImg from "../../shared/assets/wallet/CloseImg.svg";
import { API_BASE_URL } from "src/shared/config/api";
import InputWithVariants from "../EditProfile/ui/InputWithVariants/InputWithVariants";
import LinksFAQ from "../EditProfile/ui/LinksFAQ/LinksFAQ";
import styles from "./RegistrationPage.module.css";

const RegistrationPage: FC = () => {
  const navigate = useNavigate();

  const [optionsSubject, setOptionsSubject] = useState<string[]>([]);
  const [optionsUniv, setOptionsUniv] = useState<string[]>([]);
  const [optionsWorkTypes, setOptionsWorkTypes] = useState<string[]>([]);

  // Получаем данные пользователя из Telegram WebApp
  const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

  console.log("Telegram user data:", telegramUser);

  const [imageSrc, setImageSrc] = useState("");
  const [isNotify, setIsNotify] = useState(true);
  const [bioValue, setBioValue] = useState("");
  const [uniValue, setUniValue] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<string[]>([]);
  const [boxIsVisibleSubject, setBoxIsVisibleSubject] = useState(false);
  const [inputValueSubject, setInputValueSubject] = useState("");
  const [boxIsVisibleUniv, setBoxIsVisibleUniv] = useState(false);
  const [inputValueUniv, setInputValueUniv] = useState("");
  const [boxIsVisibleWorkTypes, setBoxIsVisibleWorkTypes] = useState(false);
  const [inputValueWorkTypes, setInputValueWorkTypes] = useState("");

  // Инициализируем данные из Telegram
  useEffect(() => {
    if (telegramUser) {
      console.log("Setting user data from Telegram:", telegramUser);
      setFirstName(telegramUser.first_name || "");
      setLastName(telegramUser.last_name || "");
    }
  }, [telegramUser]);

  // Получаем фото пользователя из API
  useEffect(() => {
    const fetchUserPhoto = async () => {
      if (telegramUser?.id) {
        try {
          console.log("Fetching user photo for:", telegramUser.id);
          const response = await fetch(
            `${API_BASE_URL}/contacts/user/${telegramUser.id}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `tma ${window.Telegram.WebApp.initData}`,
              },
            }
          );

          if (response.ok) {
            const contactData = await response.json();
            console.log("Contact data for photo:", contactData);

            // API возвращает объект контакта
            const contact = contactData;

            if (contact?.image_url) {
              const photoUrl = `${API_BASE_URL}${contact.image_url}`;
              console.log("Setting photo URL from API:", photoUrl);
              setImageSrc(photoUrl);
            } else {
              // Если нет image_url в API, используем фото из Telegram
              if (telegramUser.photo_url) {
                console.log(
                  "Using Telegram photo as fallback:",
                  telegramUser.photo_url
                );
                setImageSrc(telegramUser.photo_url);
              }
            }
          } else {
            // Если API возвращает ошибку (например, 404), используем фото из Telegram
            console.log("API error, using Telegram photo:", response.status);
            if (telegramUser.photo_url) {
              console.log(
                "Setting photo URL from Telegram:",
                telegramUser.photo_url
              );
              setImageSrc(telegramUser.photo_url);
            }
          }
        } catch (error) {
          console.error("Error fetching user photo:", error);
          // В случае ошибки также используем фото из Telegram
          if (telegramUser.photo_url) {
            console.log(
              "Error fallback - using Telegram photo:",
              telegramUser.photo_url
            );
            setImageSrc(telegramUser.photo_url);
          }
        }
      }
    };

    fetchUserPhoto();
  }, [telegramUser?.id, telegramUser?.photo_url]);

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
        console.log("Не удалось загрузить список предметов");
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

  const handleNotify = () => {
    setIsNotify(!isNotify);
    console.log(isNotify);
  };

  const handleSelectChangeSubject = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

  const handleRemoveOptionSubject = (optionToRemove: string) => {
    const updatedOptions = selectedOptions.filter(
      (option) => option !== optionToRemove
    );
    setSelectedOptions(updatedOptions);
  };

  const filteredOptionsSubject = filterOptions(
    optionsSubject,
    inputValueSubject
  );

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

  const filteredOptionsUniv = filterOptions(optionsUniv, inputValueUniv);

  const handleBioChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    handleBioChangeMinus(e, setBioValue);
  };

  const handleSelectChangeWorkTypes = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

  const filteredOptionsWorkTypes = filterOptions(
    optionsWorkTypes,
    inputValueWorkTypes
  );

  const handleSave = async () => {
    const { id: telegramId } = window.Telegram.WebApp.initDataUnsafe.user;

    // Определяем университет для сохранения: если есть введенное значение, используем его, иначе выбранное
    const universityToSave = inputValueUniv.trim() || uniValue;

    console.log("=== НАЧАЛО СОХРАНЕНИЯ ===");
    console.log("RegistrationPage handleSave:", {
      selectedOptions,
      selectedWorkTypes,
      university: universityToSave,
      universityField: uniValue,
      inputUniversity: inputValueUniv,
      description: bioValue,
      notify: isNotify,
      telegramId,
    });

    try {
      // Сначала обновляем контактные данные (subjects, work_types) и получаем правильный user_id
      console.log("Вызываем fetchUpdateUser с параметрами:", {
        selectedOptions,
        selectedWorkTypes,
        initData: window.Telegram.WebApp.initData,
      });

      const contactResult = await fetchUpdateUser(
        selectedOptions,
        selectedWorkTypes,
        window.Telegram.WebApp.initData
      );

      console.log(
        "fetchUpdateUser выполнен успешно, результат:",
        contactResult
      );

      // Теперь user_id и telegram_id одинаковые, используем telegram_id как user_id
      const realUserId = telegramId;
      console.log("Используем telegram_id как user_id:", realUserId);

      console.log("Вызываем updateUserProfile с параметрами:", {
        userId: realUserId,
        university: universityToSave,
        description: bioValue,
        notify: isNotify,
      });

      // Теперь обновляем данные пользователя (university, description, notify) с правильным user_id
      await updateUserProfile(realUserId, universityToSave, bioValue, isNotify);

      console.log("updateUserProfile выполнен успешно");
      console.log("=== ВСЕ ДАННЫЕ УСПЕШНО СОХРАНЕНЫ ===");
      navigate(`/`);
    } catch (error) {
      console.error("=== ОШИБКА ПРИ СОХРАНЕНИИ ===");
      console.error("Ошибка при сохранении данных:", error);
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

  return (
    <div className={styles["edit-profile"]}>
      <div className={styles["edit-profile__details"]}>
        <h2 className={styles["edit-profile__title"]}>Детали профиля</h2>

        <div
          className={styles["edit-profile__avatar"]}
          style={{
            backgroundImage: `url(${imageSrc})`,
          }}
        />

        <p className={styles["edit-profile__name"]}>
          {firstName + " " + lastName}
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
            inputFunction={handleBioChange}
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
            text="Получай уведомления о новых курсах наших преподавателей"
            isNotifyFAQ={handleNotify}
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

export default RegistrationPage;
