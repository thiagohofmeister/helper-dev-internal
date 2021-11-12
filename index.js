#!/usr/bin/env node

const program = require('commander')
const shell = require('shelljs')

program.version('1.0.0').description('Development tools')

program
  .command('config <dir>')
  .alias('c')
  .description('Configura as informações que serão utilizadas para executar os programas')
  .action(dir => {
    shell.exec(`mkdir -p ~/.thscore/helper-dev-internal`, { silent: true })
    shell.exec(`touch ~/.thscore/helper-dev-internal/config`, { silent: true })

    if ((dir.charAt(0) != '~') & (dir.charAt(0) != '/')) {
      console.log('O diretório informado deve ser absoluto')
      process.exit(1)
    }

    let save = shell.exec(
      `echo {\\"dir\\": \\"${dir}\\"} > ~/.thscore/helper-dev-internal/config`,
      {
        silent: true
      }
    )

    if (save.code == 0) {
      console.log('Configurações salvas')
      process.exit(0)
    }

    console.log('Erro ao salvar as configurações')
    console.log(save.stderr)
    process.exit(1)
  })

program
  .command('docker-up [service]')
  .alias('du')
  .description('Inicia containers de acordo com o serviço informado')
  .option('--stop', 'Desliga todos os containers em execução')
  .action((service, program) => {
    try {
      var configs = JSON.parse(
        shell.exec(`cat ~/.thscore/helper-dev-internal/config`, { silent: true }).stdout
      )
    } catch (error) {
      console.log('Program is not configured, use odt c --help')
      process.exit(1)
    }

    if (service == undefined) {
      service = shell
        .exec(`echo $PWD`, { silent: true })
        .stdout.replace(/(\r\n|\n|\r)/gm, '')
        .split('/')
        .slice(-1)[0]
    }

    let composerFiles = shell
      .exec(`ls ${configs.dir}/env | grep yaml`, { silent: true })
      .stdout.split('\n')
      .filter(n => n)
      .join(' -f ')

    if (program.stop) {
      console.log(
        shell.exec(`cd ${configs.dir}/env && docker-compose -f ${composerFiles} stop`).stdout
      )
    }

    console.log(
      shell.exec(
        `cd ${configs.dir}/env && docker-compose -f ${composerFiles} up -d --force-recreate ${service}`
      ).stdout
    )
  })

program
  .command('docker-logs [service]')
  .alias('dl')
  .description('Retorna a saída do container de acordo com o serviço informado')
  .action((service, program) => {
    try {
      var configs = JSON.parse(
        shell.exec(`cat ~/.thscore/helper-dev-internal/config`, { silent: true }).stdout
      )
    } catch (error) {
      console.log('Program is not configured, use odt c --help')
      process.exit(1)
    }

    if (service == undefined) {
      service = shell
        .exec(`echo $PWD`, { silent: true })
        .stdout.replace(/(\r\n|\n|\r)/gm, '')
        .split('/')
        .slice(-1)[0]
    }

    let composerFiles = shell
      .exec(`ls ${configs.dir}/env | grep .yaml`, { silent: true })
      .stdout.split('\n')
      .filter(n => n)
      .join(' -f ')

    console.log(
      shell.exec(`cd ${configs.dir}/env && docker-compose -f ${composerFiles} logs -f ${service}`)
        .stdout
    )
  })

program
  .command('docker-stop [service]')
  .alias('ds')
  .description('Pausa containers de acordo com o serviço informado')
  .option('--all', 'Desliga todos os containers em execução')
  .action((service, program) => {
    try {
      var configs = JSON.parse(
        shell.exec(`cat ~/.thscore/helper-dev-internal/config`, { silent: true }).stdout
      )
    } catch (error) {
      console.log('Program is not configured, use odt c --help')
      process.exit(1)
    }

    if (service == undefined) {
      service = shell
        .exec(`echo $PWD`, { silent: true })
        .stdout.replace(/(\r\n|\n|\r)/gm, '')
        .split('/')
        .slice(-1)[0]
    }

    if (program.all) {
      service = ''
    }

    let composerFiles = shell
      .exec(`ls ${configs.dir}/env | grep .yaml`, { silent: true })
      .stdout.split('\n')
      .filter(n => n)
      .join(' -f ')

    console.log(
      shell.exec(`cd ${configs.dir}/env && docker-compose -f ${composerFiles} stop ${service}`)
        .stdout
    )
  })

program.parse(process.argv)
