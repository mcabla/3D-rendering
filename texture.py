from texturize import api, commands, io

# The input could be any PIL Image in RGB mode.
image = io.load_image_from_file("assets/images/cherry-bark_diffuseOriginal.jpg")

# Coarse-to-fine synthesis runs one octave at a time.
remix = commands.Remix(image)
for result in api.process_octaves(remix, size=(4096,4096), octaves=5):
    pass

# The output can be saved in any PIL-supported format.
result.images[0].save("output.png")
