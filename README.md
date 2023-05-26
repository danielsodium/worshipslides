# Worship Slides Creator

Given a list of song titles/artists this will autmatically scrape lyrics from Musicxmatch and 
insert them into a powerpoint from a template, ready to import to Google slides. 

### How to use
Put in the Ultimate Guitar Tab Link, then wait for it to scrape.
It will generate two columns of text, one with the keys to each "verse"
thing (I don't know what they're called in music lingo) and one with
the lyrics to each. You can edit the order of each verse and also
how each verse splits up by editing the text directly. A new line
creates a line break and a empty line creates a new slide. Then upload
a template slide, which is just a pptx file that has slides with "{lyric}"
where the lyrics should be and type which slide should be used.
More options to come.

### Line Distribution
The app currently makes no effort to split up the lines between the 
slides because I am lazy so currently the only way to change is to add
a new empty line between each new slide.

### External Server
The script uses the docxtemplate slides demo to create the slideshow as the module costs an extravagent
amount of money, so it may take longer than desired.
