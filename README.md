# Test coverage report

<p align="left">
  <a href="https://github.com/ogotalski/test-coverage-report/actions"><img alt="javscript-action status" src="https://github.com/ogotalski/test-coverage-report/workflows/units-test/badge.svg"></a>
</p>

Creates comment with test coverage report in the Pull Request based on JaCoCo/Kover xml reports :rocket:

### Code coverage report

#### :open_file_folder: 20.88% of the overall code covered by tests. 39.36% in master
#### :inbox_tray: 17.31% of the files changed in pr covered by tests.
##### Details:
<details><summary><kbd>org.test.main.<b>Math.kt</b></kbd> - <b>75%</b>  (75%)</summary>

```diff
# 01: package org.test.main
# 02: 
# 03: 
# 04: import org.test.math.utils.MathUtils
# 05: 
+ 06: class Math {
# 07:     fun getFibonacci(int: Int): Long {
! 08:         if (int > 1)
+ 09:             return MathUtils().fibonacciCalc(int.toLong())
- 10:         if (int < 0)
- 11:             return 0L
- 12:         return 1L
# 13:         }
# 14: }
```
[org.test.main.Math.kt](https://github.com/ogotalski/test/blob/58beb484ea117d001269755f5e54877a5318fe00/src%2Fmain%2Fkotlin%2Forg%2Ftest%2Fmain%2FMath.kt)

<hr/></details>

<details><summary><kbd>org.test.math.utils.<b>FibonacciForkJoinUtil.java</b></kbd> - <b>0%</b>  (0%)</summary>

```diff
# 01: package org.test.math.utils;
# 02: 
# 03: import java.util.concurrent.*;
# 04: 
- 05: public class FibonacciForkJoinUtil implements FibonacciUtil {
# 06: 
- 07:     ForkJoinPool executorService = (ForkJoinPool) Executors.newWorkStealingPool();
# 08: 
# 09:     @Override
# 10:     public long calc(long number) {
# 11:         try {
- 12:             return executorService.invoke(new FibonacciTask(number));
- 13:         } catch (Exception e) {
- 14:             throw new RuntimeException(e);
# 15:         }
# 16:     }
# 17: 
# 18:     private class FibonacciTask extends RecursiveTask<Long>
# 19:     {
# 20:         private Long number;
# 21: 
- 22:         public FibonacciTask(Long number) {
- 23:             this.number = number;
- 24:         }
# 25: 
# 26:         @Override
# 27:         protected Long compute() {
- 28:             if (number <= 2) return 1L;
# 29: 
- 30:             FibonacciTask fibonacciTask1 = new FibonacciTask(number - 1);
- 31:             fibonacciTask1.fork();
- 32:             FibonacciTask fibonacciTask2 = new FibonacciTask(number - 2);
- 33:             return fibonacciTask2.compute() + fibonacciTask1.join();
# 34:         }
# 35:     }
# 36: }
# 37: 
```
[org.test.math.utils.FibonacciForkJoinUtil.java](https://github.com/ogotalski/test/blob/58beb484ea117d001269755f5e54877a5318fe00/MathUtils%2Fsrc%2Fmain%2Fjava%2Forg%2Ftest%2Fmath%2Futils%2FFibonacciForkJoinUtil.java)

<hr/></details>

<hr/>

### :rotating_light: Coverage decrease files outside PR
##### Details:
 <details><summary><kbd>org.test.math.utils.<b>FibonacciRecurUtil.java</b></kbd> - <b>0%</b>  (100%)</summary>

<dl><dd> <details><summary>
 <b>PR:</b> <kbd><b>FibonacciRecurUtil.java#L02-22</b></kbd>

```diff
# 02: 
# 03: import java.util.HashMap;
# 04: import java.util.Map;
# 05: 
- 06: public class FibonacciRecurUtil implements FibonacciUtil {
# 07: 
- 08:     Map<Long, Long> cacheMap = new HashMap<>();
# 09: 
# 10:     @Override
# 11:     public long calc(long number) {
- 12:         if (number <= 2) return 1;
- 13:         if (!cacheMap.containsKey(number))
# 14:         {
- 15:             cacheMap.put(number, calc(number - 1) + calc(number - 2));
# 16:         }
- 17:         return  cacheMap.get(number);
# 18:     }
# 19: }
# 20: 
```
</summary>

<b>Master:</b> <kbd><b>FibonacciRecurUtil.java#L02-22</b></kbd>
 ```diff
# 02: 
# 03: import java.util.HashMap;
# 04: import java.util.Map;
# 05: 
+ 06: public class FibonacciRecurUtil implements FibonacciUtil {
# 07: 
+ 08:     Map<Long, Long> cacheMap = new HashMap<>();
# 09: 
# 10:     @Override
# 11:     public long calc(long number) {
+ 12:         if (number <= 2) return 1;
+ 13:         if (!cacheMap.containsKey(number))
# 14:         {
+ 15:             cacheMap.put(number, calc(number - 1) + calc(number - 2));
# 16:         }
+ 17:         return  cacheMap.get(number);
# 18:     }
# 19: }
# 20: 
```
</details>

 </dd></dl>


<hr/></details>

## Usage


```yaml
uses: ogotalski/test-coverage-report@v1.4
with:
  paths: ${{ github.workspace }}/build/reports/jacoco/test/jacocoTestReport.xml,${{ github.workspace }}/MathUtils/build/reports/jacoco/test/jacocoTestReport.xml
  sourcePaths: ${{ github.workspace }}/src/main/kotlin,${{ github.workspace }}/MathUtils/src/main/java
  masterPaths: ${{ github.workspace }}/code-coverage-report/build/reports/jacoco/test/jacocoTestReport.xml,${{ github.workspace }}/code-coverage-report/MathUtils/build/reports/jacoco/test/jacocoTestReport.xml
  token: ${{ secrets.GITHUB_TOKEN }}
  updateComment: true
  debug: true
  artifactWorkflow: main.yml
  artifactName: code-coverage-report
  downloadPath: code-coverage-report
```

## Example of workflow
```yaml
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
        id: setup
        with:
          java-version: 1.8
      - name: Run Coverage
        run: |
          chmod +x gradlew
          ./gradlew test jacocoTestReport
      - name: Test coverage report
        uses: ogotalski/test-coverage-report@v1.4
        with:
          paths: ${{ github.workspace }}/build/reports/jacoco/test/jacocoTestReport.xml,${{ github.workspace }}/MathUtils/build/reports/jacoco/test/jacocoTestReport.xml
          sourcePaths: ${{ github.workspace }}/src/main/kotlin,${{ github.workspace }}/MathUtils/src/main/java
          masterPaths: ${{ github.workspace }}/code-coverage-report/build/reports/jacoco/test/jacocoTestReport.xml,${{ github.workspace }}/code-coverage-report/MathUtils/build/reports/jacoco/test/jacocoTestReport.xml
          token: ${{ secrets.GITHUB_TOKEN }}
          updateComment: true
          debug: true
          artifactWorkflow: main.yml
          artifactName: code-coverage-report
          downloadPath: code-coverage-report
```
See the [actions tab](https://github.com/ogotalski/test/actions) for runs of this action! :rocket:
