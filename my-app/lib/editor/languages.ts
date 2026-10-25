import type { Language } from "@/types";

export interface LanguageMeta {
  id: Language;
  label: string;
  version: string;
  monacoId: string;
  fileName: string;
}

export const LANGUAGES: Record<Language, LanguageMeta> = {
  cpp: { id: "cpp", label: "C++", version: "GNU C++17", monacoId: "cpp", fileName: "main.cpp" },
  java: { id: "java", label: "Java", version: "OpenJDK 17", monacoId: "java", fileName: "Main.java" },
  python: { id: "python", label: "Python", version: "Python 3.11", monacoId: "python", fileName: "main.py" },
  go: { id: "go", label: "Go", version: "Go 1.22", monacoId: "go", fileName: "main.go" },
};

export const LANGUAGE_ORDER: Language[] = ["cpp", "java", "python", "go"];

export const STARTER_CODE: Record<Language, string> = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // Read the input, solve, and print the answer.

    return 0;
}
`,
  java: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        PrintWriter out = new PrintWriter(new BufferedWriter(new OutputStreamWriter(System.out)));

        // Read the input, solve, and print the answer.

        out.flush();
    }
}
`,
  python: `import sys


def main():
    data = sys.stdin.read().split()
    # Read the input, solve, and print the answer.


if __name__ == "__main__":
    main()
`,
  go: `package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	in := bufio.NewReader(os.Stdin)
	out := bufio.NewWriter(os.Stdout)
	defer out.Flush()

	// Read the input, solve, and print the answer.
	_ = in
	fmt.Fprint(out, "")
}
`,
};
