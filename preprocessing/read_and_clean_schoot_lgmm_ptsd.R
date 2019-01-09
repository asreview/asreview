# Merge data files
# author: Kees van Eijden
# Create a train dataset for Systematic Reviews from the list of articles
# selected by Rens van de Schoot for his LGMM PTSD study
# The first file (schoot-lgmm-ptsd-initial.csv) contains articles downloaded from Scopus after a search;
# the second file (schoot-lgmm-ptsd-included-1) contains articles selected from the first file after title screening.
# the result us a train data set with all the articles form the initial file but with an extra attribute included_ats.
# If the value is 1 the article was selected after title screening, 0 if not
# There is also a third file (schoot-lgmm-ptsd-included-2) with the final selection of articles. The same proces is repeated
#  resulting in a attribute included_final with value 1 if in the final selection and 0 if not.
# Run this program as a script RScript mergeDataFiles.R > merge.out. The file merge.out gives a description of the
#  merging and cleaning steps taken. The scripts leaves also several .csv files behind in the data directory. Thesw files contain articles
#  removed from the training set, because they don't have abstracts or titles, or they are duplicates.
# Last but not least, the file ./data/example_dataset_1/csv/schoot-lgmm-ptsd-traindata.csv contains the merged and cleaned train data.


library(tidyverse)
library(tm)


cat("mergeDataFiles: Reading Initial Search data (IS, is), Included After Title Screening (ATS, ats) and Final Included (FINAL, fin).\n")
is_raw <- read.csv(file = "./data/example_dataset_1/csv/schoot-lgmm-ptsd-initial.csv",
                header= TRUE, sep= ",", stringsAsFactors = FALSE)
is <- select(is_raw, abstract, title, id) #for now only abstract, title and id (EndNote ID) are relevant
is$title <- tolower(is$title)


ats <- read.csv(file = "./data/example_dataset_1/csv/schoot-lgmm-ptsd-included-1.csv",
                    header= TRUE, sep= ",", stringsAsFactors = FALSE)
ats <- select(ats, abstract, title, id) #from this file we only need these attributes
ats$title <- tolower(ats$title)

in2 <- read.csv(file = "./data/example_dataset_1/csv/schoot-lgmm-ptsd-included-2.csv",
                      header= TRUE, sep= ",", stringsAsFactors = FALSE)
in_final <- select(in2, abstract, title, id) #from this file we only need these attributes
in_final$title <- tolower(in_final$title)
cat("\n\n")
#merging tables
cat("mergeDataFiles: merging files")
ats$included_ats <- 1       #these articles are included after title screening
train_data  <- left_join(is, ats, by=c("title"))
train_data$included_ats[is.na(train_data$included_ats)] <- 0 #and these are not included


#these articles in ATS file did not have a match in the IS file
ats_leftovers <- anti_join(x=ats, y=is, by=c("title"))
if (nrow(ats_leftovers) > 0) {
    cat("... articles in ATS not in IS: ", nrow(ats_leftovers), "  written to file.\n")
    write.csv(ats_leftovers, "./data/example_dataset_1/csv/schoot-lgmm-ptsd-leftOvers-1.csv")
}

t <- table(train_data$included_ats)
cat("...articles in train_data:                         ", t[1]+t[2], "\n")
cat("...articles included 1 (after title screening):    ", t[2], "\n")
cat("\n\n")

in_final$included_final <- 1       #these articles are included in the final set
train_data  <- left_join(train_data, in_final, by=c("title"))
train_data$included_final[is.na(train_data$included_final)] <- 0 #and these are not included in the final set

final_leftovers <- anti_join(x=in_final, y=train_data, by=c("title"))
if (nrow(final_leftovers) > 0) {
    cat("... articles in final selectionbut  not in IS: ", nrow(final_leftovers), "  written to file.\n")
    write.csv(final_leftovers, "./data/example_dataset_1/csv/schoot-lgmm-ptsd-leftOvers-2.csv")
}


t <- table(train_data$included_final)
cat("...articles included 2 (final):    ", t[2], "\n")
cat("\n\n")


#cleaning of train data
cat("mergeDataFiles: Start cleaning the data.\n")


#recovering abstract from ATS file if abstract of article is missing in IS file
no_abstract_is <- (train_data$abstract.x == '') & (train_data$included_ats == 1)
before <- table(no_abstract_is)

train_data$abstract.x[no_abstract_is] <- train_data$abstract.y[no_abstract_is]
no_abstract_is <- (train_data$abstract.x == '')& (train_data$included_ats == 1)
after <- table(no_abstract_is)
cat("...", before[2]-after[2], " abstracts recovered from ATS file\n")


#attributes from ATS file no more needed
train_data <- train_data %>% select(title, abstract= abstract.x, id= id.x, included_ats, included_final)

no_abstract <- train_data %>% filter(abstract == "") %>% summarize(n())
if (no_abstract[[1]] > 0) {
    cat("...#articles without abstract: ", no_abstract[[1]], "..written to file and deleted from train data\n")
    articles_without_abstracts <- train_data %>% filter(abstract == "")
    write.csv(articles_without_abstracts, "./data/example_dataset_1/csv/schoot-lgmm-ptsd-withoutAbstracts.csv")
    train_data <- train_data %>% filter(abstract != "")
}

t <- table(train_data$included_ats)
cat("...articles in train_data:                     ", t[1]+t[2], "\n")
cat("...articles included after title screening:    ", t[2], "\n")

t <- table(train_data$included_final)
cat("...articles included 2 (final):                    ", t[2], "\n")
cat("\n\n")

no_title <- filter(train_data, title == "") %>% summarize(n())
if (no_title[[1]] > 0) {
    cat("...#articles without title: ", no_title[[1]], "..written to file and deleted from train data.\n")
    articles_without_title <- train_data %>% filter(title == "")
    write.csv( articles_without_title, "./data/example_dataset_1/csv/schoot-lgmm-ptsd-withoutTitles.csv")
    train_data <- train_data %>% filter(title != "")
}

t <- table(train_data$included_ats)
cat("...articles in train_data:                         ", t[1]+t[2], "\n")
cat("...articles included 1 after title screening:      ", t[2], "\n")

t <- table(train_data$included_final)
cat("...articles included 2 (final):                    ", t[2], "\n")
cat("\n\n")

#look for duplicate articles: titles+abstracts are equal
dup_articles <- train_data %>% group_by(title, abstract) %>% summarize(n=n(), id= min(id)) %>% filter(n >1)
if ((dup= nrow(dup_articles)) > 0) {
    cat("...#duplicate articles (title&abstract): ", dup, "..written to file and duplicates deleted.\n")
    dup_articles1 <- semi_join(train_data, dup_articles, by=c("abstract", "title"))
    write.csv(dup_articles1, "./data/example_dataset_1/csv/schoot-lgmm-ptsd-duplicateArticles.csv")

    #keep only one occurence of article; the one with lowest endnote id
    train_data <- left_join(train_data, dup_articles, by= c("abstract", "title"))

    train_data <- train_data %>% filter((id.x == id.y) | (is.na(id.y))) %>%
                    select(id=id.x, abstract, title, included_ats, included_final)
}

t <- table(train_data$included_ats)
cat("...articles in train_data:                     ", t[1]+t[2], "\n")
cat("...articles included 1 after title screening:  ", t[2], "\n")

t <- table(train_data$included_final)
cat("...articles included 2 (final):                ", t[2], "\n")
cat("\n\n")

train_data <- train_data %>% mutate(title = stringr::str_trim(title))

#titles with multiple occurences
dup_titles <- train_data %>% group_by(title) %>% summarize(n= n(), id= min(id)) %>% filter(n > 1)
if ((dup= nrow(dup_titles)) > 0) {
    cat("...#duplicate titles: ", dup, "..written to file\n")
    dup_titles1 <- semi_join(train_data, dup_titles, by=c("title"))
    write.csv(dup_titles1, "./data/example_dataset_1/csv/schoot-lgmm-ptsd-duplicateTitles.csv")

    #keep only one occurence of title; the one with lowest endnote ID
    train_data <- left_join(train_data, dup_titles, by= c("title"))
    train_data <- train_data %>% filter((id.x == id.y) | (is.na(id.y))) %>%
                    select(id=id.x, abstract, title, included_ats, included_final)
}
t <- table(train_data$included_ats)
cat("...articles in train_data:                     ", t[1]+t[2], "\n")
cat("...articles included 1 after title screening:  ", t[2], "\n")

t <- table(train_data$included_final)
cat("...articles included 2 (final):                ", t[2], "\n")
cat("\n\n")

#abstracts with multiple occurences
dup_abstracts <- train_data %>% group_by(abstract) %>% summarize(n= n(), id= min(id)) %>% filter(n > 1)
if ((dup= nrow(dup_abstracts)) > 0) {

    cat("...#duplicate abstracts: ", dup, "..written to file\n")
    dup_abstracts1 <- semi_join(train_data, dup_abstracts, by=c("abstract"))
    write.csv(dup_abstracts1, "./data/example_dataset_1/csv/schoot-lgmm-ptsd-dupAbstracts.csv")

    #keep only one occurence of abstract; the one with lowest endnote id
    train_data <- left_join(train_data, dup_abstracts, by= c("abstract"))
    train_data <- train_data %>% filter((id.x == id.y) | (is.na(id.y))) %>%
                    select(id= id.x, abstract, title, included_ats, included_final)
}


# Clean text data

clean_corpus <- function(corpus){
  corpus <- tm_map(corpus, content_transformer(tolower))
  corpus <- tm_map(corpus, removePunctuation, ucp = TRUE)
  corpus <- tm_map(corpus, removeWords, stopwords("en"))
  corpus <- tm_map(corpus, removeNumbers)
  corpus <- tm_map(corpus, stripWhitespace)
  return(corpus)
}

text <- with(train_data, paste(title, abstract)) # Concatenate title and abstract
text <- tolower(text)
text <- gsub("(©|copyright|rights reserved|psycinfo database).+", "", text) # Remove copyright notices at the end
text <- gsub("[=]", "", text) # Remove copyright notices

text_corpus <- tm::VCorpus(tm::VectorSource(text))
text_corpus_clean <- clean_corpus(text_corpus)

train_data$text <- sapply(text_corpus_clean, `[[`, 1) %>% stringr::str_trim()

#write out the train data

cat("...write cleaned train data to file\n")

join_data <- select(train_data, id, included_ats, included_final, text)
output <- inner_join(is_raw, join_data, by=c("id"))
write.csv(output, "./data/example_dataset_1/csv/schoot-lgmm-ptsd-traindata.csv", row.names = FALSE)

t <- table(output$included_ats)
cat("...articles in train_data:                         ", t[1]+t[2], "\n")
cat("...articles included 1 (after title screening):    ", t[2], "\n")
t <- table(output$included_final)
cat("...articles included 2 (final):                    ", t[2], "\n")
cat("\n\n")

cat("...number of articles grouped by type of reference:")
overview <- output %>% group_by(type_of_reference) %>% summarise(n=n())
print(overview)
cat("\nmergeDataFiles: ====== end of program =====\n")

