import { createContext, useContext, useReducer } from "react";

const storageNames = {
  fontSize: "fontSize",
  showModelInfo: "showModelInfo",
};

const initialReviewSettings = () => {
  let localFontSize = parseInt(
    window.localStorage.getItem(storageNames.fontSize),
  );
  localFontSize =
    localFontSize === 0 ||
    localFontSize === 1 ||
    localFontSize === 2 ||
    localFontSize === 3
      ? localFontSize
      : 1;

  return {
    [storageNames.fontSize]: localFontSize,
    [storageNames.showModelInfo]: true,
  };
};

const ReviewSettingsContext = createContext(null);
const ReviewSettingsDispatchContext = createContext(null);

export function ReviewSettingsProvider({ children }) {
  const [reviewSettings, dispatchReviewSettings] = useReducer(
    ReviewSettingsReducer,
    initialReviewSettings(),
  );

  return (
    <ReviewSettingsContext.Provider value={reviewSettings}>
      <ReviewSettingsDispatchContext.Provider value={dispatchReviewSettings}>
        {children}
      </ReviewSettingsDispatchContext.Provider>
    </ReviewSettingsContext.Provider>
  );
}

function ReviewSettingsReducer(reviewSettings, action) {
  switch (action.type) {
    // Add a case for the fontSize action
    case storageNames.fontSize: {
      window.localStorage.setItem(storageNames.fontSize, action.fontSize);
      return { ...reviewSettings, fontSize: action.fontSize };
    }

    // Add a case for the showModelInfo action
    case storageNames.showModelInfo: {
      window.localStorage.setItem(
        storageNames.showModelInfo,
        action.showModelInfo,
      );
      return { ...reviewSettings, showModelInfo: action.showModelInfo };
    }

    // Add a default case that throws an error
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}

export function useReviewSettings() {
  return useContext(ReviewSettingsContext);
}

export function useReviewSettingsDispatch() {
  return useContext(ReviewSettingsDispatchContext);
}
