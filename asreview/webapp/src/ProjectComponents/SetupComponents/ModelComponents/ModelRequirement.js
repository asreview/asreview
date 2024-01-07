import * as React from "react";
import { Link } from "@mui/material";
import InfoCard from "../InfoCard";

const requirements = [
  {
    value: "tensorflow",
    link: "https://asreview.readthedocs.io/en/latest/generated/asreview.models.classifiers.NN2LayerClassifier.html#asreview-models-classifiers-nn2layerclassifier",
  },
  {
    value: "gensim",
    link: "https://asreview.readthedocs.io/en/latest/generated/asreview.models.feature_extraction.Doc2Vec.html#asreview-models-feature-extraction-doc2vec",
  },
  {
    value: "sentence-transformers",
    link: "https://asreview.readthedocs.io/en/latest/generated/asreview.models.feature_extraction.SBERT.html#asreview-models-feature-extraction-sbert",
  },
];

const requirement = (requirement) => {
  const link = requirements.find(
    (element) => element.value === requirement,
  )?.link;

  return (
    <>
      requires <code>{requirement}</code> to be installed.{" "}
      <Link underline="none" href={link} target="_blank">
        Learn more
      </Link>{" "}
    </>
  );
};

const ModelRequirement = (props) => {
  const getLabel = (modelName, fieldName) => {
    return props.modelOptions?.[modelName]
      ?.filter((e) => e.name === fieldName)
      ?.map((e) => e.label + " ");
  };

  const returnRequirement = () => {
    return (
      <>
        Some combinations take a long time to warm up. Some classifiers and
        feature extraction techniques require additional dependencies.{" "}
        {(props.model?.classifier === "nn-2-layer" ||
          props.model?.feature_extraction === "embedding-idf" ||
          props.model?.feature_extraction === "embedding-lstm") && (
          <>
            {props.model?.feature_extraction === "tfidf" &&
              "This combination might crash on some systems with limited memory. "}
            {props.model?.classifier === "nn-2-layer" &&
              getLabel("classifier", "nn-2-layer")}
            {props.model?.feature_extraction === "embedding-idf" &&
              getLabel("feature_extraction", "embedding-idf")}
            {props.model?.feature_extraction === "embedding-lstm" &&
              getLabel("feature_extraction", "embedding-lstm")}
            {requirement("tensorflow")}
          </>
        )}
        {props.model?.feature_extraction === "doc2vec" && (
          <>
            {getLabel("feature_extraction", "doc2vec")}
            {requirement("gensim")}
          </>
        )}
        {props.model?.feature_extraction === "sbert" && (
          <>
            {getLabel("feature_extraction", "sbert")}
            {requirement("sentence-transformers")}
          </>
        )}
      </>
    );
  };

  return <InfoCard info={returnRequirement()} />;
};

export default ModelRequirement;
