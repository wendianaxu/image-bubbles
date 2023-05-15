# Project 03 - Image Points

## Reflection
This piece is a tool for people to take any image of their choice and transform it to something new. I mainly applied concepts and techniques such as autonomous agents, noise and randomness, colors, mouse behaviors, and text input. While developing the piece, I tried to find a balance between three things: keeping the original structure of the image, user control, and elements of surprise. 

The basic form of the piece without any further user interaction largely maintains the structure of the original image by turning it into a collection of points that forms a more abstract representation of the image. By hovering on the points and inputting text, users can start to transform this representation further in the way that they want by recoloring certain parts of the image. They can also control the way the image is recolored (randomness or noise), radius of their mouse's effects, and turn on/off the recoloring effect any time during their interaction with the points. This would allow a variety of ways to engage with the piece -- for example, they can be very precise by using a small mouse radius to target only the exact shapes that they want to recolor in the image. 

On the other hand, there are things that users cannot control, such as the randomness and noise processes in recoloring the points based on its original colors and how the text input recolors certain points that roughly resemble the text's shape but doesn't necessarily make the text recognizable. Mouse hovering also changes how the points are spatially aligned for a short amount of time. These elements allow users to explore unexpected effects on their image and what they eventually lead to. For example, if they recolor the entire image to the greatest extent, they will end up with something like a rainbow-colored heatmap, which is almost entirely new. But it still preserves some structure from their original image and can be seen as a highly abstract version of it. 

I think that this work is complete. I am most proud of the nice visual effects of the recoloring and the degree of freedom that users have when interacting with this piece. What I am the least proud of is how I handled the text input -- if I had more time, I would enable users to change the size and position of the text dynamically. The hardest part for me in completing this project was maintaining the balance between order and complexity. I initially wanted to the points to move around according to certain rules, but realized it would make things too messy. How to maintain this balance is also what I have learned most from completing this project. 
## 5/8 First Draft
I have implemented the following for this draft:
- Redrawing an uploaded image as a group of points with noise texture
- The points are able to perform seek and flee behaviors
- The points flee from the mouse and the shape of text input
- The points change colors upon mouse hovering

I am happy about how I redraw uploaded images. I think it gives the images a unique style. I also like how mouse hovering allows users to give vibrant touches to the images. 

I am not happy with how the points flee from the text right now -- they look too messy. I also plan to make the points change colors based on their original colors instead of randomly, to make the piece look more cohesive. 

There are other things that I have been trying to implement but have been stuck for now:
- Let every point seek the point that has the most different color from itself. I have wrote a method (findColor()) for this but calling it made most points on the canvas disappear. 
- Change the saturation and hue of points when hovered. I tried to do this by switching between the RGB and HSB modes, but what I have tried so far always made the points reflect wrong colors of the image, probably because the image.get() method gets RGB values only. 

The biggest challenge going forward for this project is that I hope to add more dynamics to the piece that change the image in a more fundamental way, for example by making some points seek others that meet a certain color criteria. I will need to first address the obstacles in implementing such mechanisms, and then experiment with different options to produce visually intriguing results. 


