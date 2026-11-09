---
title: "The Pragmatic Redemption: How WSL, VS Code, and Open Source Won the Developer Desktop"
description: "In 2001, Microsoft called Linux a cancer. By 2026, millions of engineers write Linux systems code on Windows every day. An architectural deconstruction of WSL 1 vs. WSL 2, the Language Server Protocol, the 9P filesystem boundary tax, and how Microsoft dismantled proprietary bloat to capture the modern developer desktop."
pubDate: 2026-08-30
category: 'software-engineering'
tags: ['linux', 'windows', 'wsl', 'vscode', 'open-source', 'systems', 'architecture']
draft: false
readingTime: '17 min'
---

In June 2001, Microsoft Chief Executive Steve Ballmer gave a now-infamous interview to the *Chicago Sun-Times*. Speaking about the GNU General Public License, he uttered one of the most quotable insults in the history of computer science:

> *"Linux is a cancer that attaches itself in an intellectual property sense to everything it touches."*

At the turn of the millennium, Microsoft was an aggressive, monopolistic empire. Its corporate worldview was simple: Windows was the only platform that mattered. 

The developer experience was locked behind proprietary barriers: the Win32 API, Microsoft Foundation Classes (MFC), Component Object Model (COM), and the monolithic Visual Studio IDE a closed, multi-gigabyte installer designed to tie software engineers exclusively to the Windows ecosystem. If you used open-source software, you were viewed with corporate suspicion. The prevailing operational philosophy was summarized by the Department of Justice's antitrust findings: *Embrace, Extend, and Extinguish*.

Fast-forward twenty-five years.

Open your Windows terminal today. Run `wsl`. In less than 800 milliseconds, you are dropped into a full, genuine Linux bash prompt running an Ubuntu or Debian distribution. 

You run `git clone`, edit C and Rust code inside Visual Studio Code with native language servers, compile native ELF binaries, launch Docker containers using real Linux kernel cgroups, and execute CUDA matrix multiplications directly against your NVIDIA GPU all without rebooting, without dual-booting, and without the sluggish overhead of an old-school virtual machine.

How did the company that once waged war on open source come to ship a custom Linux kernel inside every copy of its flagship operating system?

The story of the **Windows Subsystem for Linux (WSL)** and **Visual Studio Code** is not a story of sudden corporate benevolence. It is a story of pragmatic survival, ruthless architectural pivots, and the realization that **developers are the sovereign power of the computing industry**. 

Here is the architectural deconstruction of how Windows transformed from the enemy of open source into one of the most effective Linux development workstations on the planet and the engineering trade-offs that make it work.

---

## The Existential Crisis: The Great Silicon Valley Exodus

Between 2005 and 2014, Microsoft hit an existential wall.

First, it lost mobile. Apple's iOS and Google's Android completely demolished Windows Phone. 

Second, it lost the server room. The backend infrastructure of the global internet cloud computing, containers, distributed databases, microservices standardized entirely on Linux. Nobody was deploying Docker containers on Windows Server; they were deploying them on Ubuntu, Debian, and CentOS inside Amazon Web Services (AWS).

Third, and most dangerously, **it lost the developers**.

By 2012, if you walked through the offices of Google, Facebook, Twitter, or any high-growth startup in Silicon Valley, you would struggle to find a single Windows laptop. The modern web and cloud stack was fundamentally POSIX-native. Node.js, Python, Ruby on Rails, Git, and Docker were built by and for Unix-like environments. 

On Windows, developers suffered through a nightmare of clunky compromises:
- Cygwin: A slow, leaky translation layer that tried to map POSIX calls to Win32 DLLs.
- MinGW / MSYS2: Minimalist environments that frequently broke on complex C dependencies.
- VirtualBox / VMware Workstation: Heavy, battery-draining VMs that took minutes to boot, consumed 8GB of static RAM, and isolated files behind cumbersome network shares.

The default developer machine became the **Apple MacBook Pro**. macOS offered the Holy Grail: an industrial-grade Unix terminal (Darwin/BSD) coupled with polished desktop hardware, superior battery life, and high-DPI font rendering.

When Satya Nadella took over as Microsoft CEO in 2014, the handwriting was on the wall: **If developers do not use Windows to build their software, they will not use Azure to run their software.**

To survive, Microsoft had to dismantle its proprietary dogma.

---

## Architectural Act I: WSL 1 (The Syscall Translation Illusion)

In 2016, Microsoft stunned the engineering world at its Build conference by announcing the **Windows Subsystem for Linux (WSL 1)**.

The architectural premise of WSL 1 was audacious: **What if we could run unmodified Linux ELF binaries directly on the Windows NT kernel without running a Linux kernel?**

```mermaid
graph TB
    subgraph WSL1["WSL 1: Syscall Translation Architecture (2016)"]
        ElfApp["Unmodified Linux Binary (ELF)<br/>e.g., /bin/bash, gcc, python"]
        Pico["Pico Process (User-Mode Linux Emulation)"]
        LxCore["lxcore.sys & lxss.sys<br/>(Kernel-Mode Syscall Translation Layer)"]
        NTKernel["Windows NT Kernel (ntoskrnl.exe)"]
        Hardware["Physical Hardware (CPU, RAM, Disk)"]

        ElfApp --> Pico
        Pico -->|Linux Syscall: fork(), epoll()| LxCore
        LxCore -->|Translated to NT API: NtCreateProcess()| NTKernel
        NTKernel --> Hardware
    end
```

### The Engineering of "Pico Processes"
WSL 1 did not use virtualization. It borrowed an architectural concept developed by Microsoft Research called **Drawbridge** (Pico processes and driver-level security isolation).

When you launched an ELF binary (like `/bin/ls`):
1. The Windows kernel created a special **Pico Process** an address space that lacked the standard Win32 subsystem structures.
2. When the Linux binary made a system call (for example, `fork()`, `execve()`, or `epoll_create()`), the call was intercepted in kernel mode by two translation drivers: `lxcore.sys` and `lxss.sys`.
3. These drivers parsed the Linux registers, translated the request into the equivalent Windows NT kernel internal API (such as `NtCreateUserProcess`), and returned the result formatted as a Linux response.

### Why WSL 1 Hit a Brick Wall
WSL 1 was a masterclass in reverse engineering, but it was doomed by the fundamental **semantic impedance mismatch** between POSIX and the Windows NT kernel:

#### 1. File Deletion and Locking Semantics
In POSIX/Linux, you can delete (`unlink`) an open file. If Process A has `database.db` open for reading, Process B can delete it; the directory entry disappears immediately, while Process A continues reading from its open file descriptor until it closes it. 

In Windows NTFS, opening a file places an exclusive sharing lock on it. If another process tries to delete an open file, the NT kernel rejects the operation with `ERROR_SHARING_VIOLATION`. This single discrepancy broke dozens of Linux package managers, build tools, and git operations.

#### 2. The `fork()` Nightmare
The foundational process-creation primitive in Unix is `fork()`: an exact, copy-on-write clone of the parent process's memory space and file descriptors. 

Windows NT does not have `fork()`. It has `CreateProcess()`, which spawns a fresh process from an executable file on disk. Emulating `fork()` on top of the NT kernel required massive, complex memory-copying acrobatics that throttled performance.

#### 3. Missing Hardware Primitives (The Docker Block)
Modern cloud infrastructure relies on Linux kernel primitives: **cgroups (Control Groups)** for resource limiting, **namespaces** for network and filesystem isolation, and **netfilter/iptables** for routing. 

Because WSL 1 had no Linux kernel, it had no cgroups and no namespaces. **Docker could not run natively inside WSL 1.**

Developers loved the convenience of having `bash` on Windows, but running intensive build systems (`cargo build`, `npm install`, or Linux kernel compilation) was brutally slow, and edge-case syscall bugs triggered constant crashes.

Microsoft realized that translating POSIX to Win32 was a losing battle. The only way to provide 100% Linux compatibility was to run **real Linux**.

---

## Architectural Act II: WSL 2 (The Micro-VM Realist)

In 2019, Microsoft threw away the translation layer and released **WSL 2**. 

The new architecture made a complete philosophical pivot: instead of trying to teach the Windows NT kernel how to speak Linux, **Microsoft built a hyper-optimized, custom Linux kernel and ran it alongside Windows on top of the Hyper-V hypervisor.**

```mermaid
graph TB
    subgraph WSL2["WSL 2: Utility VM & Real Linux Kernel Architecture (2019)"]
        subgraph WindowsSide["Windows Host (NT)"]
            WinApps["Windows GUI Apps (Explorer, Terminal)"]
            WinKernel["Windows NT Kernel"]
            WinVsock["Virtual Sockets (HVSOCKET)"]
        end

        subgraph Hypervisor["Type-1 Hypervisor (Hyper-V)"]
            subgraph LinuxVM["Lightweight Utility VM (~800ms Boot)"]
                CustomKernel["Custom Microsoft Linux Kernel (GPLv2, Open Source)"]
                cgroups["Native cgroups v2, Namespaces, eBPF, systemd"]
                DirectX["DirectX GPU Compute Driver (/dev/dxg)"]
                Ext4["Native ext4 Filesystem (virtual hard disk: .vhdx)"]
                LinuxDistro["Userland (Ubuntu, Debian, Arch Linux)"]
                
                CustomKernel --- cgroups
                CustomKernel --- DirectX
                CustomKernel --- Ext4
                CustomKernel --- LinuxDistro
            end
        end

        WinApps --- WinKernel
        WinKernel <===>|High-Speed Shared Memory & vsock| CustomKernel
        DirectX <===>|GPU Paravirtualization (WDDM)| WinKernel
    end
```

### The Anatomy of the Utility VM
WSL 2 is not a traditional virtual machine like those created in VirtualBox or VMware. It is a **Lightweight Utility VM**:
- **Instant Boot**: Boots from cold to a shell in under **800 milliseconds**.
- **Dynamic Memory Allocation**: It does not lock a static block of host RAM (like 8GB or 16GB). It requests memory from the Windows host on demand, and returns memory back to Windows using the Linux kernel's **Page Reporting** mechanism when processes terminate.
- **Custom Open-Source Kernel**: Microsoft maintains its own open-source Linux kernel branch on GitHub (`microsoft/WSL2-Linux-Kernel`), optimized specifically for desktop responsiveness, virtualization paravirtualization drivers, and fast boot times.
- **100% POSIX Compliance**: Because it is an actual Linux kernel, every system call works natively. `fork()`, `epoll()`, `io_uring`, `cgroups v2`, network namespaces, and raw sockets execute with zero translation overhead. Docker, Kubernetes (k3s, minikube), and systemd run natively.

### Direct GPU Passthrough: CUDA Without Dual Booting
One of the most consequential engineering achievements of WSL 2 was bridging the physical GPU across the hypervisor boundary.

Historically, giving a virtual machine access to a discrete GPU required **PCIe Passthrough (IOMMU)**, which severed the GPU from the host operating system. If you gave your VM the GPU, your Windows host lost display output!

Microsoft worked with NVIDIA, AMD, and Intel to develop **GPU Paravirtualization (GPU-PV)** over the Windows Display Driver Model (WDDM):
- Inside the WSL 2 Linux kernel, Microsoft implemented a paravirtualized compute driver exposed as `/dev/dxg`.
- When an AI engineer runs PyTorch or a CUDA matrix multiplication inside WSL 2, the CUDA runtime communicates directly with `/dev/dxg`.
- The driver marshals compute commands over shared memory to the Windows host driver, which schedules them directly on physical silicon Tensor Cores!

An engineer can train an LLM or run stable diffusion inside an Ubuntu WSL 2 container with **99% of bare-metal Linux performance**, while simultaneously browsing the web and running Windows desktop applications on the same physical GPU.

---

## 3. The Mechanical Reality: The Filesystem Boundary Tax

Despite the brilliant engineering of WSL 2, there is one architectural compromise that catches every developer off guard: **The Cross-OS Filesystem Tax**.

Windows and Linux use fundamentally different storage paradigms:
- Windows uses **NTFS** (or ReFS) with drive letters (`C:\`, `D:\`).
- Linux uses **ext4** (or btrfs/XFS) mounted inside a single root hierarchy (`/`).

In WSL 2, your Linux distribution does not format your physical SSD as ext4. It stores the entire Linux filesystem inside an expandable Virtual Hard Disk file on your Windows drive:
```
C:\Users\<User>\AppData\Local\Packages\CanonicalGroupLimited...\LocalState\ext4.vhdx
```

This creates two distinct storage zones with vastly different performance characteristics:

```
+-----------------------------------------------------------------------------------------+
|                                    THE TWO ZONES                                        |
+-----------------------------------------------------------------------------------------+
| ZONE 1: The Native Linux Realm (ext4.vhdx)                                              |
| Path: /home/username/projects/my-app/                                                   |
| • Access Speed: Bare-metal NVMe disk speeds (~3,000 to ~7,000 MB/s).                    |
| • Native Linux VFS, inode caches, and inotify events.                                   |
| • Status: ULTRA FAST (git, cargo, npm, go build fly in seconds).                         |
+-----------------------------------------------------------------------------------------+
                                          |
                                          | [CROSS-BOUNDARY 9P / VIRTIO-FS BRIDGE]
                                          v
+-----------------------------------------------------------------------------------------+
| ZONE 2: The Windows Mount Realm (/mnt/c/)                                               |
| Path: /mnt/c/Users/username/Desktop/my-app/                                             |
| • Access Speed: Serialized over 9P network protocol / virtual socket (vsock).           |
| • Metadata translation, path mapping, and permission emulation on every single read.    |
| • Status: BRUTALLY SLOW (10x to 50x performance degradation for small files).           |
+-----------------------------------------------------------------------------------------+
```

### The Novice Mistake
A junior engineer installs WSL 2, keeps their code inside `C:\Users\gaurav\code\project`, and navigates to it inside Linux via:
```bash
cd /mnt/c/Users/gaurav/code/project
npm install
```

The build takes five minutes, and fans scream at maximum RPM. 

Why? Because `npm install` creates 40,000 microscopic files inside `node_modules`. Every single file read, write, and directory traversal must cross the Hyper-V virtual socket boundary over the **Plan 9 (9P)** or **virtio-fs** filesystem protocol, translating Linux metadata into NTFS permissions on every system call!

### The Senior Rule
**Always store your repositories inside the native Linux filesystem (`/home/username/...` or `~`)**.

When your code lives in native ext4, file operations execute directly against the Linux VFS buffer cache with zero host translation overhead. If you need to access those files from Windows Explorer, you use the special network redirector:
```
\\wsl.localhost\Ubuntu\home\username\projects\
```

---

## 4. The Second Engine: How VS Code Killed the Monolith

WSL solved the runtime problem, but running a shell is only half the battle. How do you edit code without reverting to terminal Vim or running a bloated X11 window server?

This brings us to the second pillar of Microsoft's redemption: **Visual Studio Code**.

### The Problem with the Visual Studio Monolith
In 2010, Visual Studio was an engineering relic of the 1990s:
- It was written in C++ and C# on top of WPF.
- It took 45 minutes to install from four DVDs or an enormous ISO file.
- It created brittle, proprietary `.sln` and `.vcxproj` metadata files.
- It was deeply, inextricably bound to the Windows platform.

Meanwhile, developers were falling in love with lightweight, fast-launching text editors: **Sublime Text**, **Atom**, and **Vim**.

Microsoft made a radical decision: instead of trying to port the legacy Visual Studio monolith to Linux and Mac, they hired **Erich Gamma** (one of the legendary Gang of Four authors of *Design Patterns* and the technical father of Eclipse) to build a completely new, lightweight editor from scratch.

### 1. The Language Server Protocol (LSP)
Historically, code editors faced a combinatorial scaling crisis known as the **$M \times N$ problem**:
- If you have $M$ programming languages (C++, Python, Go, Rust, TypeScript...)
- And $N$ code editors (VS Code, Vim, Emacs, Sublime, Eclipse...)
- Developers had to write $M \times N$ custom plugins to support autocomplete, syntax highlighting, and go-to-definition for every editor!

```
THE M x N CHAOS (Historically):
Languages: [ Rust ]   [ Go ]   [ Python ]   [ C++ ]
               \     /    \     /    \     /
                \   /      \   /      \   /
Editors:     [ VS Code ]   [ NeoVim ]   [ Sublime ]   [ Emacs ]
(Result: 16 separate, fragile plugins to maintain!)

THE M + N ELEGANCE (Language Server Protocol):
Languages: [ rust-analyzer ]  [ gopls ]  [ pyright ]  [ clangd ]
                   \             |            |            /
                    v            v            v           v
            +-------------------------------------------------+
            |       Language Server Protocol (JSON-RPC)       |
            +-------------------------------------------------+
                   ^            ^            ^           ^
                  /              |            |            \
Editors:     [ VS Code ]   [ NeoVim ]   [ Sublime ]   [ Emacs ]
(Result: 4 language servers + 4 editor clients = 8 clean integrations!)
```

In 2016, Microsoft, in collaboration with Red Hat and Codenvy, standardized the **Language Server Protocol (LSP)**.

LSP turned language tooling into an out-of-process JSON-RPC protocol. Instead of the editor compiling C++ to find symbols, it launches a background process (`clangd` or `rust-analyzer`). When the user types, the editor sends a JSON message:
```json
{
  "method": "textDocument/completion",
  "params": { "textDocument": { "uri": "file:///main.c" }, "position": { "line": 42, "character": 15 } }
}
```
The language server computes the completions and sends back a response. 

This single architectural innovation completely decoupled code editing from language compilation.

### 2. The Decoupled Remote Architecture (The Masterstroke)
LSP set the stage for VS Code's most consequential architectural superpower: **Remote Development**.

When you use the **VS Code Remote - WSL** extension, the editor splits its brain into two completely isolated processes across the OS boundary:

```mermaid
graph LR
    subgraph WindowsClient["Windows Host (Client Realm)"]
        Electron["VS Code Desktop UI (Electron)"]
        Renderer["Chromium GPU-Accelerated Canvas & DOM"]
        Input["Local Keyboard, Mouse, Window Management"]
        ExtensionsUI["UI Extensions (Themes, Keymaps)"]
        
        Electron --- Renderer
        Electron --- Input
        Electron --- ExtensionsUI
    end

    subgraph LinuxServer["WSL 2 Utility VM (Server Realm)"]
        NodeServer["VS Code Server (Headless Node.js Daemon)"]
        LSP["Language Servers (rust-analyzer, clangd, gopls)"]
        Debugger["Native Linux Debuggers (gdb, lldb)"]
        Terminals["Native PTYs (/bin/zsh, /bin/bash)"]
        CodeBase["Source Code on ext4 Filesystem"]
        
        NodeServer --- LSP
        NodeServer --- Debugger
        NodeServer --- Terminals
        NodeServer --- CodeBase
    end

    Renderer <===>|vsock / Localhost IPC (JSON-RPC & Binary)| NodeServer
```

Look closely at what happens here:
- **On Windows**: The Electron GUI runs natively on the Windows desktop. It handles window rendering, font rasterization, keyboard inputs, and desktop theming. It uses Windows graphics APIs and benefits from full laptop battery management.
- **Inside Linux**: A headless Node.js daemon (`vscode-server`) runs inside the WSL 2 utility VM. It executes all language servers, watches files, manages terminals, and runs the compiler (`gcc`, `cargo`, `go`).
- **The Bridge**: The two halves communicate over an ultra-fast virtual socket (`vsock`) using streaming JSON-RPC and binary serialization.

When you press `F5` to debug a program, the debugger attached to your process is not a Windows debugger pretending to understand Linux; it is native Linux **`gdb`** or **`lldb`** reading native ELF symbols inside the ext4 filesystem!

You get the seamless aesthetic polish of a first-class Windows desktop application paired with the raw, uncompromising power of a native Linux development server.

---

## 5. The Systems Critique: The Friction and the Walled Garden

An objective engineering analysis cannot simply celebrate the victories. It must examine the scars, the structural limitations, and the corporate tensions inherent in this setup.

### 1. The `vmmem` Memory Gobbler
The most common complaint from developers using WSL 2 is the runaway memory usage of the Windows **`vmmem`** process.

Because Linux is designed under the philosophy that *"free memory is wasted memory,"* the Linux kernel aggressively uses spare RAM for its **page cache** (caching disk blocks in memory). 

Under Hyper-V dynamic memory sizing, the host Windows system sees the Linux VM claiming gigabytes of memory and fails to reclaim it quickly enough during heavy Windows workloads. If you do not constrain it, WSL 2 can easily consume 80% to 90% of your machine's physical RAM!

The fix requires manually dropping a hardware throttle file into `C:\Users\<User>\.wslconfig`:

```ini
[wsl2]
# Restrict WSL 2 VM to 8 GB of RAM
memory=8GB
# Limit CPU core allocation to prevent build starvation
processors=8
# Enable automatic memory reclamation
autoMemoryReclaim=dropcache
```

### 2. Networking Topology Headaches
Historically, WSL 2 ran inside its own virtualized Network Address Translation (NAT) subnet. 

This meant your Linux guest had a completely different IP address from your Windows host (`172.x.x.x` vs `192.168.x.x`). While localhost forwarding worked for simple HTTP servers, it frequently broke:
- Connecting from outside your local LAN to a dev server running in WSL.
- Corporate VPNs (like Cisco AnyConnect or GlobalProtect) intercepting routing tables and silently severing WSL's internet access.
- Complex microservice architectures where Docker containers expect identical network interfaces.

Only recently (Windows 11 23H2) did Microsoft introduce **Mirrored Networking Mode** (`networkingMode=mirrored`), which maps the Linux network interfaces directly to the Windows host adapters, finally resolving a five-year-old networking headache.

### 3. The Open-Source Paradox: The Walled Garden of Extensions
Here lies the deepest corporate critique: **Is Microsoft truly open source, or has it simply modernized its proprietary moats?**

Consider the licensing reality:
- The core of VS Code is published as **Code - OSS** under the permissive MIT license on GitHub.
- However, the binary distribution you download from Microsoft's website (`code.exe`) is released under a **proprietary Microsoft product license** that includes telemetry and proprietary services.
- More crucially, the **Remote Development extension pack** (Remote-WSL, Remote-Containers, Remote-SSH) the very software that makes the WSL remote architecture possible is **closed source and proprietary**.

The marketplace license explicitly forbids using Microsoft's remote extensions on non-Microsoft builds of the editor (such as **VSCodium**, the fully open-source, telemetry-free fork). 

Microsoft did not give up on owning developer ecosystems. It simply moved the moat: from the operating system kernel up into the developer toolchain and extension marketplace.

### 4. The Cloud Conversion Funnel
Why did Microsoft spend millions of engineering hours perfecting Linux on Windows?

Because of **Azure**. 

Every hour a software engineer spends inside WSL 2 and VS Code is an hour they spend working within Microsoft's terminal, using Microsoft's editor, syncing their repository with Microsoft's GitHub, and deploying their Docker containers to Azure Kubernetes Service (AKS). 

WSL was not an act of charity; it was the ultimate strategic bridge to ensure that Windows remained relevant in a cloud-first, Linux-dominated computing universe.

---

## The Verdict: The Developer Desktop Redeemed

Twenty-five years after Steve Ballmer labeled Linux a cancer, the outcome of the operating system wars is clear: **Linux won the server and the cloud, but Windows and open source formed an alliance to win the developer desktop.**

For decades, software engineers were forced to make an unpalatable binary choice:
- **Choose Linux as your host OS**: Enjoy bare-metal command-line supremacy, but suffer through flaky display drivers, broken sleep/wake cycles, audio glitches, and the absence of enterprise business software (Microsoft Office, Adobe Creative Suite).
- **Choose Windows as your host OS**: Enjoy rock-solid hardware stability, world-class multi-monitor handling, and broad application support, but endure a castrated terminal and broken POSIX tooling.
- **Choose macOS**: Pay a hefty hardware premium to get a Unix environment, while wrestling with proprietary Apple silicon quirks and non-ELF container emulation.

WSL 2 and Visual Studio Code dismantled this trilemma.

By pairing a real Hyper-V Linux microkernel with a decoupled client-server editor, Microsoft transformed Windows into a pragmatic engineering platform. You write native Linux code on an ext4 filesystem with full CUDA GPU passthrough, while resting on the hardware stability, sleep reliability, and application compatibility of Windows.

It is an architecture built not on ideological purity, but on ruthless pragmatism: accepting the reality of the Linux server, respecting the developer's tools, and building the fastest bridge between the two.

---

### Foundational References & Technical Documentation

1. **Microsoft Corporation.** (2020). *Comparing WSL 1 and WSL 2: Architecture and Performance Characteristics*. Microsoft Learn Documentation. [Microsoft Docs](https://learn.microsoft.com/en-us/windows/wsl/compare-versions).
2. **Ionescu, Alex.** (2016). *The Evolution of the Windows Kernel: From Pico Processes to WSL*. Black Hat USA 2016 Presentation.
3. **Microsoft Open Source.** (2024). *WSL2-Linux-Kernel Source Repository (GPLv2)*. [GitHub Repository](https://github.com/microsoft/WSL2-Linux-Kernel).
4. **Gamma, Erich, Helm, Richard, Johnson, Ralph, & Vlissides, John.** (1994). *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley.
5. **Language Server Protocol Consortium.** (2016). *Language Server Protocol Specification (v3.17)*. [Official Specification](https://microsoft.github.io/language-server-protocol/).
6. **Russinovich, Mark E., Solomon, David A., & Ionescu, Alex.** (2017). *Windows Internals, Part 1: System Architecture, Processes, Threads, Memory Management, and More* (7th ed.). Microsoft Press.
7. **Pfalz, B., & Song, Y.** (2021). *GPU Paravirtualization Architecture in Windows Display Driver Model (WDDM)*. Microsoft Technical Architecture Papers.
