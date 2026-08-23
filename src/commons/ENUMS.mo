module Enums{

    // How to use:
    // let exam : AssessmentType = #EXAM;
    public type AssessmentType ={
        #EXAM;
        #QUIZ;
        #ASSIGNMENT;
        #FLASHCARDS
    };

    public type ContentType = {
        #VIDEO;
        #AUDIO;
        #ARTICLE;
        #TUTORIAL;
    }; 

    public type Difficulty = {
        #EASY;
        #NORMAL;
        #HARD;
    };

    public type SourceType = {
        #BOOK;
        #ARTICLE;
        #VIDEO;
        #AUDIO;
        #TUTORIAL;
    };
}