import { createContext, useContext, useReducer } from "react";

const storageNames = {
  fontSize: "fontSize",
  modelLogLevel: "modelLogLevel",
  orientation: "orientation",
  expandAbstract: "expandAbstract",
};

const orientationOptions = ["portrait", "landscape"];
const modelLogLevelOptions = ["info", "warning"];

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

  let localModelLogLevel = modelLogLevelOptions.includes(
    window.localStorage.getItem(storageNames.modelLogLevel),
  )
    ? window.localStorage.getItem(storageNames.modelLogLevel)
    : "warning";

  let orientation = orientationOptions.includes(
    window.localStorage.getItem(storageNames.orientation),
  )
    ? window.localStorage.getItem(storageNames.orientation)
    : "portrait";

  let expandAbstract =
    window.localStorage.getItem(storageNames.expandAbstract) === "true";

  return {
    [storageNames.fontSize]: localFontSize,
    [storageNames.modelLogLevel]: localModelLogLevel,
    [storageNames.orientation]: orientation,
    [storageNames.expandAbstract]: expandAbstract,
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

    // Add a case for the modelLogLevel action
    case storageNames.modelLogLevel: {
      window.localStorage.setItem(
        storageNames.modelLogLevel,
        action.modelLogLevel,
      );
      return { ...reviewSettings, modelLogLevel: action.modelLogLevel };
    }

    // Add a case for the orientation action
    case storageNames.orientation: {
      window.localStorage.setItem(storageNames.orientation, action.orientation);
      return { ...reviewSettings, orientation: action.orientation };
    }

    // Add a case for the expandAbstract action
    case storageNames.expandAbstract: {
      window.localStorage.setItem(
        storageNames.expandAbstract,
        action.expandAbstract,
      );
      return { ...reviewSettings, expandAbstract: action.expandAbstract };
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
