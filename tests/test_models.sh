
DATASET="van_de_schoot_2018"

QUERY_STRATEGIES=('max_random' 'max_uncertainty' 'max' 'uncertainty' 'random')
# ('max_random' 'max_uncertainty' 'max' 'uncertainty' 'random' 'cluster')

for qs in "${QUERY_STRATEGIES[@]}"
do
  asreview simulate synergy:${DATASET} -q $qs --seed 535 --prior-seed 535 -o ${DATASET}_${qs}.asreview
  asreview plot recall ${DATASET}_${qs}.asreview -o ${DATASET}_${qs}_recall.png
done



BALANCE_STRATEGIES=('balanced')

for bs in "${BALANCE_STRATEGIES[@]}"
do
  asreview simulate synergy:${DATASET} -q $bs --seed 535 --prior-seed 535 -o ${DATASET}_${bs}.asreview
  asreview plot recall ${DATASET}_${bs}.asreview -o ${DATASET}_${bs}_recall.png
done



MODELS=('logistic' 'nb' 'rf' 'svm')
# MODELS=('logistic' 'lstm-base' 'lstm-pool' 'nb' 'nn-2-layer' 'rf' 'svm')

for m in "${MODELS[@]}"
do
  asreview simulate synergy:${DATASET} -q $m --seed 535 --prior-seed 535 -o ${DATASET}_${m}.asreview
  asreview plot recall ${DATASET}_${m}.asreview -o ${DATASET}_${m}_recall.png
done



FEATURE_STRATEGIES=('tfidf' 'onehot')
# FEATURE_STRATEGIES=('doc2vec' 'embedding-idf' 'embedding-lstm' 'sbert' 'tfidf')

for fs in "${FEATURE_STRATEGIES[@]}"
do
  asreview simulate synergy:${DATASET} -q $fs --seed 535 --prior-seed 535 -o ${DATASET}_${fs}.asreview
  asreview plot recall ${DATASET}_${fs}.asreview -o ${DATASET}_${fs}_recall.png
done
