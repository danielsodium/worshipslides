# Worship Slides Creator

Given a list of song titles/artists this will autmatically scrape lyrics from Musicxmatch and 
insert them into a powerpoint from a template, ready to import to Google slides. 

## Usage
Add a template pptx file (called template.pptx) to the directory. This can be any number of 
slides long but must have a text box with "{lyrics}" to replace with lyrics. Add a file called 
"links.txt" with a list of songs. Each song should start with a number as to which slide
in the template to use.

#### Example

links.txt \
3 reckless love cory asbury \
1 promises maverick \
5 this is amazing grace 

This will output a pptx with the lyrics to reckless love on template slide number 3, promises on 
template slide 1, and this is amazing grace in template slide 5. Note that larger template files
will cause the program to take longer to run due to sending the template to another server.

### Word Distribution
The script does its best to combine short lyric lines together on a slide, but further human
revision would be wise to get spacing better.

### External Server
The script uses the docxtemplate slides demo to create the slideshow as the module costs an extravagent
amount of money, so it may take longer than desired.