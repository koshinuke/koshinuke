@call env.cmd
python %CLOSURE_LIB%/closure/bin/calcdeps.py --dep %CLOSURE_LIB%/closure/goog -p ../js/org -e ../js/org/koshinuke/deps.js -o deps > ../js/org/koshinuke/deps.js