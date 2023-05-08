# Project 03 - Image Points

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
## Reflection

