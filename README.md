# Test coverage report

<p align="center">
  <a href="https://github.com/ogotalski/test-coverage-report/actions"><img alt="javscript-action status" src="https://github.com/ogotalski/test-coverage-report/workflows/units-test/badge.svg"></a>
</p>

Creates comment with test coverage report in the Pull Request based on JaCoCo/Kover xml reports :rocket:

### Code coverage report

#### :open_file_folder: 39.36% of the overall code covered by tests.
#### :inbox_tray: 22.78% of the files changed in pr covered by tests.
---
##### Details:
<details><summary>org.test.main.<b>Math.kt</b> - <b>75%</b></summary>

```diff
# 01: package org.test.main
# 02: 
# 03: 
# 04: import org.test.math.utils.MathUtils
# 05: 
+ 06:  class Math {
# 07:     fun getFibonacci(int: Int): Long {
! 08:          if (int > 1)
+ 09:              return MathUtils().fibonacciCalc(int.toLong())
- 10:          if (int < 0)
- 11:              return 0L
- 12:          return -1L
# 13:         }
# 14: }
# 15: 
```
[org.test.main.Math.kt](https://github.com/ogotalski/test/blob/d11bf3fdc689362cbd24dad2e54cf3cdf3f36a78/src%2Fmain%2Fkotlin%2Forg%2Ftest%2Fmain%2FMath.kt)

<hr/></details>

<details><summary>org.test.math.utils.<b>FibonacciParallelUtil.java</b> - <b>0%</b></summary>

```diff
# 01: package org.test.math.utils;
# 02: 
# 03: import java.util.concurrent.ExecutorService;
# 04: import java.util.concurrent.Executors;
# 05: 
- 06:  public class FibonacciParallelUtil implements FibonacciUtil {
# 07: 
- 08:      ExecutorService executorService = Executors.newFixedThreadPool(5);
# 09: 
# 10:     @Override
# 11:     public long calc(long number) {
- 12:          if (number <= 2) return 0;
# 13:         try {
- 14:              long result = executorService.submit(() -> calc(number - 1)).get() +
- 15:                      executorService.submit(() -> calc(number - 2)).get();
- 16:              return result;
- 17:          } catch (Exception e) {
- 18:              throw new RuntimeException(e);
# 19:         }
# 20:     }
# 21: }
# 22: 
```
[org.test.math.utils.FibonacciParallelUtil.java](https://github.com/ogotalski/test/blob/d11bf3fdc689362cbd24dad2e54cf3cdf3f36a78/MathUtils%2Fsrc%2Fmain%2Fjava%2Forg%2Ftest%2Fmath%2Futils%2FFibonacciParallelUtil.java)

<hr/></details>


## Usage


```yaml
uses: ogotalski/test-coverage-report@v1.0
  with:
    paths: ${{ github.workspace }}/build/reports/jacoco/test/jacocoTestReport.xml,${{ github.workspace }}/MathUtils/build/reports/jacoco/test/jacocoTestReport.xml
    htmlReports: ${{ github.workspace }}/build/jacocoHtml,${{ github.workspace }}/MathUtils/build/jacocoHtml
    title: "Code coverage report"
    updateComment: true
    token: ${{ secrets.GITHUB_TOKEN }}
```

## Example of workflow
```
name: Measure coverage

on:
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up JDK 1.8
        uses: actions/setup-java@v1
        with:
          java-version: 1.8
      - name: Run Coverage
        run: |
          chmod +x gradlew
          ./gradlew test
      - name: Test coverage report
        uses: ogotalski/test-coverage-report@v1.0
        with:
          paths: ${{ github.workspace }}/build/reports/jacoco/test/jacocoTestReport.xml,${{ github.workspace }}/MathUtils/build/reports/jacoco/test/jacocoTestReport.xml
          sourcePaths: ${{ github.workspace }}/src/main/kotlin,${{ github.workspace }}/MathUtils/src/main/java
          token: ${{ secrets.GITHUB_TOKEN }}
```
See the [actions tab](https://github.com/ogotalski/test/actions) for runs of this action! :rocket:
