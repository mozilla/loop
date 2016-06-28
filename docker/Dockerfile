FROM          ubuntu:15.10

# A lot of this was based on from
# http://hg.mozilla.org/mozilla-central/file/0a25833062a8/testing/docker/desktop-test/Dockerfile
# XXX We spin our own, as we need a more up-to-date version of ubuntu than
# mozilla-central currently uses (for Google Chrome). Once bug 1281179 is fixed,
# we can probably switch to the new images and reduce this.

RUN apt-get update -y && apt-get install -y wget

# Note: we install Firefox & Chrome here so we have the base dependencies already
# installed.
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'

RUN apt-get update -y && apt-get install -y git \
  firefox \
  google-chrome-stable \
  python-dev \
  python-pip \
  nodejs \
  nodejs-legacy \
  npm \
  sudo \
  wget \
  x11vnc \
  xutils \
  xvfb \
  zip \
  && apt-get clean

RUN update-alternatives --install /usr/bin/node node /usr/bin/nodejs 10

RUN pip install virtualenv virtualenvwrapper mozdownload pyperclip

# configure git and install tc-vcs
RUN git config --global user.email "nobody@mozilla.com" && \
    git config --global user.name "mozilla"

# Set variable normally configured at login, by the shells parent process, these
# are taken from GNU su manual
ENV           HOME          /home/worker
ENV           SHELL         /bin/bash
ENV           USER          worker
ENV           LOGNAME       worker
ENV           HOSTNAME      taskcluster-worker
# This makes the unit tests run in travis mode, aka disabling the sandbox
# on Google Chrome.
ENV           TRAVIS        1

# add worker user and setup its workspace
RUN           useradd -d /home/worker -s /bin/bash -m worker
RUN           echo "worker:worker" | chpasswd
### We allow sudo, so that we can ensure google chrome is the latest without having
### to rebuild the docker image all the time.
RUN           adduser worker sudo
RUN           sudo echo "worker ALL=(ALL) NOPASSWD:ALL" | sudo tee -a /etc/sudoers
WORKDIR       /home/worker
RUN           mkdir -p /home/worker/bin
COPY          setup-x11.sh /home/worker/bin/
RUN           chmod 755 /home/worker/bin/*
RUN           chown -R worker:worker /home/worker
USER          worker

# Various useful directories
RUN           mkdir artifacts
RUN           mkdir artifacts/public

# Set up VNC
RUN           mkdir /home/worker/.vnc
RUN           x11vnc -storepasswd 1234 /home/worker/.vnc/passwd

# Disable Ubuntu update prompt
# http://askubuntu.com/questions/515161/ubuntu-12-04-disable-release-notification-of-14-04-in-update-manager
ADD release-upgrades /etc/update-manager/release-upgrades

# Disable tools with on-login popups that interfere with tests; see bug 1240084 and bug 984944.
ADD jockey-gtk.desktop deja-dup-monitor.desktop /etc/xdg/autostart/

# Disable apport (Ubuntu app crash reporter) to avoid stealing focus from test runs
ADD apport /etc/default/apport

# Disable font antialiasing for now to match releng's setup
ADD fonts.conf /home/worker/.fonts.conf

# In test.sh we accept START_VNC to start a vnc daemon.
# Exposing this port allows it to work.
EXPOSE 5900

# This helps not forgetting setting DISPLAY=:0 when running
# tests outside of test.sh
ENV DISPLAY :0

# Set a default command useful for debugging
CMD ["/bin/bash", "--login"]
