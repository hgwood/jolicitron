echo [ACTUAL]
cat actual.txt
echo [EXPECTED]
cat /jolicitron/test/bin/expected.txt

cmp actual.txt /jolicitron/test/bin/expected.txt && echo TEST OK || echo TEST NOT OK
