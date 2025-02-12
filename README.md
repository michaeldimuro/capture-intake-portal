# capture-intake-portal

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/michaeldimuro/capture-intake-portal)


Here's a step-by-step guide to set up HTTPS locally using `mkcert`:

1. First, install mkcert:

On macOS with Homebrew:
```
brew install mkcert
brew install nss # if you use Firefox
```

On Windows:
```
choco install mkcert
```

On Linux:
```
sudo apt install libnss3-tools
sudo apt install mkcert
```

2. Install the local Certificate Authority:

```
mkcert -install
```

3. Create a local certificate and key:

```
mkcert localhost
```
