import type { Submission } from "@/types";
import type { Timeline } from "./timeline";

/**
 * Twelve full submission records (with source). Eight belong to the demo
 * member so their history, dashboard and profile have something real to show.
 * Additional rival attempts used for standings live in leaderboard.ts as
 * compact judge events.
 */
export function seedSubmissions(t: Timeline): Submission[] {
  const c41 = (minute: number) => t.contestMinute(t.c41Start, minute);
  const c42 = (minute: number) => t.contestMinute(t.c42Start, minute);
  const done = { status: "completed" as const, compileOutput: undefined };

  return [
    { ...done, id: "S-10231", userId: "u_member", problemId: "CA101", contestId: "weekly-41", kind: "contest", language: "cpp", verdict: "wrong_answer", contestMinute: 9, createdAt: c41(9), timeMs: 15, memoryKb: 3480, passedTests: 2, totalTests: 4, failedTest: 3, source: SRC.ca101WrongCpp },
    { ...done, id: "S-10236", userId: "u_member", problemId: "CA101", contestId: "weekly-41", kind: "contest", language: "cpp", verdict: "accepted", contestMinute: 14, createdAt: c41(14), timeMs: 31, memoryKb: 3912, passedTests: 4, totalTests: 4, failedTest: null, source: SRC.ca101Cpp },
    { ...done, id: "S-10254", userId: "u_member", problemId: "CA102", contestId: "weekly-41", kind: "contest", language: "python", verdict: "time_limit_exceeded", contestMinute: 41, createdAt: c41(41), timeMs: 1000, memoryKb: 14200, passedTests: 2, totalTests: 3, failedTest: 3, source: SRC.ca102SlowPy },
    { ...done, id: "S-10262", userId: "u_member", problemId: "CA102", contestId: "weekly-41", kind: "contest", language: "python", verdict: "accepted", contestMinute: 58, createdAt: c41(58), timeMs: 412, memoryKb: 18640, passedTests: 3, totalTests: 3, failedTest: null, source: SRC.ca102Py },
    { ...done, id: "S-10297", userId: "u_member", problemId: "CA103", contestId: "weekly-41", kind: "contest", language: "cpp", verdict: "wrong_answer", contestMinute: 131, createdAt: c41(131), timeMs: 88, memoryKb: 9840, passedTests: 2, totalTests: 4, failedTest: 3, source: SRC.ca103WrongCpp },
    { ...done, id: "S-10279", userId: "u_ananya", problemId: "CA103", contestId: "weekly-41", kind: "contest", language: "cpp", verdict: "memory_limit_exceeded", contestMinute: 120, createdAt: c41(120), timeMs: 640, memoryKb: 262144, passedTests: 3, totalTests: 4, failedTest: 4, source: SRC.ca103MleCpp },
    { ...done, id: "S-10340", userId: "u_member", problemId: "CA101", contestId: null, kind: "practice", language: "go", verdict: "accepted", contestMinute: null, createdAt: t.daysAgo(3, 5), timeMs: 22, memoryKb: 6120, passedTests: 4, totalTests: 4, failedTest: null, source: SRC.ca101Go },
    { ...done, id: "S-10412", userId: "u_sneha", problemId: "CA104", contestId: "weekly-42", kind: "contest", language: "cpp", verdict: "accepted", contestMinute: 8, createdAt: c42(8), timeMs: 46, memoryKb: 4100, passedTests: 3, totalTests: 3, failedTest: null, source: SRC.ca104Cpp },
    { ...done, id: "S-10418", userId: "u_member", problemId: "CA104", contestId: "weekly-42", kind: "contest", language: "cpp", verdict: "accepted", contestMinute: 12, createdAt: c42(12), timeMs: 52, memoryKb: 4180, passedTests: 3, totalTests: 3, failedTest: null, source: SRC.ca104Cpp },
    { ...done, id: "S-10421", userId: "u_rohan", problemId: "CA104", contestId: "weekly-42", kind: "contest", language: "java", verdict: "runtime_error", contestMinute: 15, createdAt: c42(15), timeMs: 96, memoryKb: 38900, passedTests: 1, totalTests: 3, failedTest: 2, source: SRC.ca104ReJava },
    { id: "S-10433", userId: "u_member", problemId: "CA105", contestId: "weekly-42", kind: "contest", language: "java", status: "completed", verdict: "compilation_error", contestMinute: 28, createdAt: c42(28), timeMs: null, memoryKb: null, passedTests: 0, totalTests: 3, failedTest: null, source: SRC.ca105CeJava, compileOutput: "Main.java:9: error: ';' expected\n        int n = s.length()\n                          ^\n1 error" },
    { ...done, id: "S-10437", userId: "u_sneha", problemId: "CA105", contestId: "weekly-42", kind: "contest", language: "cpp", verdict: "accepted", contestMinute: 31, createdAt: c42(31), timeMs: 118, memoryKb: 36200, passedTests: 3, totalTests: 3, failedTest: null, source: SRC.ca105Cpp },
  ];
}

const SRC = {
  ca101WrongCpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> a(n);
    int total = 0;                 // overflows on large inputs
    for (auto &x : a) { cin >> x; total += x; }

    int prefix = 0;
    for (int k = 1; k < n; k++) {
        prefix += a[k - 1];
        if (2 * prefix == total) { cout << k << "\\n"; return 0; }
    }
    cout << -1 << "\\n";
}
`,
  ca101Cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;
    vector<long long> a(n);
    long long total = 0;
    for (auto &x : a) { cin >> x; total += x; }

    long long prefix = 0;
    for (int k = 1; k < n; k++) {
        prefix += a[k - 1];
        if (2 * prefix == total) { cout << k << "\\n"; return 0; }
    }
    cout << -1 << "\\n";
    return 0;
}
`,
  ca101Go: `package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	in := bufio.NewReader(os.Stdin)
	var n int
	fmt.Fscan(in, &n)
	a := make([]int64, n)
	var total int64
	for i := range a {
		fmt.Fscan(in, &a[i])
		total += a[i]
	}
	var prefix int64
	for k := 1; k < n; k++ {
		prefix += a[k-1]
		if 2*prefix == total {
			fmt.Println(k)
			return
		}
	}
	fmt.Println(-1)
}
`,
  ca102SlowPy: `import sys

def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    t = list(map(int, data[1:1 + n]))
    clock = 0
    total = 0
    while t:                      # O(n^2): repeatedly pick the shortest
        best = min(t)
        t.remove(best)
        clock += best
        total += clock
    print(total)

main()
`,
  ca102Py: `import sys

def main():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    t = sorted(map(int, data[1:1 + n]))
    clock = total = 0
    for x in t:
        clock += x
        total += clock
    print(total)

main()
`,
  ca103WrongCpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    vector<vector<int>> g(n + 1);
    vector<int> indeg(n + 1, 0), depth(n + 1, 1);
    for (int i = 0; i < m; i++) {
        int u, v; cin >> u >> v;
        g[u].push_back(v);
        indeg[v]++;
    }
    queue<int> q;
    for (int i = 1; i <= n; i++) if (!indeg[i]) q.push(i);
    int best = 0;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        best = max(best, depth[u]);
        for (int v : g[u]) {
            depth[v] = max(depth[v], depth[u] + 1);
            if (--indeg[v] == 0) q.push(v);
        }
    }
    cout << best << "\\n";      // forgot to detect cycles
}
`,
  ca103MleCpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    vector<vector<int>> adj(n + 1, vector<int>(n + 1, 0));   // n^2 matrix
    for (int i = 0; i < m; i++) { int u, v; cin >> u >> v; adj[u][v] = 1; }
    // ...
}
`,
  ca104Cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<int> a(n);
    for (auto &x : a) cin >> x;
    while (q--) {
        int x; cin >> x;
        cout << (upper_bound(a.begin(), a.end(), x) - a.begin()) << '\\n';
    }
    return 0;
}
`,
  ca104ReJava: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());
        int n = Integer.parseInt(st.nextToken()), q = Integer.parseInt(st.nextToken());
        int[] a = new int[n];
        st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) a[i] = Integer.parseInt(st.nextToken());
        StringBuilder out = new StringBuilder();
        while (q-- > 0) {
            int x = Integer.parseInt(br.readLine().trim());
            int lo = 0, hi = n;
            while (lo < hi) { int mid = (lo + hi) / 2; if (a[mid + 1] <= x) lo = mid + 1; else hi = mid; }
            out.append(lo).append('\\n');
        }
        System.out.print(out);
    }
}
`,
  ca105CeJava: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        // dp[i][j] = min insertions for s[i..j]

        int n = s.length()
        int[][] dp = new int[n][n];
        for (int len = 2; len <= n; len++)
            for (int i = 0; i + len - 1 < n; i++) {
                int j = i + len - 1;
                dp[i][j] = s.charAt(i) == s.charAt(j) ? dp[i + 1][j - 1]
                         : 1 + Math.min(dp[i + 1][j], dp[i][j - 1]);
            }
        System.out.println(dp[0][n - 1]);
    }
}
`,
  ca105Cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    string s;
    cin >> s;
    int n = s.size();
    vector<vector<int>> dp(n, vector<int>(n, 0));
    for (int len = 2; len <= n; len++)
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            dp[i][j] = s[i] == s[j] ? dp[i + 1][j - 1] : 1 + min(dp[i + 1][j], dp[i][j - 1]);
        }
    cout << dp[0][n - 1] << "\\n";
}
`,
};
