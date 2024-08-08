import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';
import Redis, { Redis as RedisClientType } from 'ioredis';

// Jest 설정
jest.setTimeout(60000);

describe('Redis Test with Testcontainers', () => {
  let redisClient: RedisClientType;
  let container: StartedRedisContainer;

  beforeAll(async () => {
    // Redis 컨테이너 시작
    container = await new RedisContainer().start();

    // Redis 클라이언트 생성 및 연결
    redisClient = new Redis(container.getConnectionUrl());
  });

  afterAll(async () => {
    // Redis 클라이언트 연결 종료 및 컨테이너 중지
    await redisClient.quit();
    await container.stop();
  });

  // beforeEach(async () => {
  //   await redisClient.flushall(); // 모든 키 삭제
  // });

  test('Redis에 값을 설정하고 가져오기', async () => {
    // Redis에 값 설정
    await redisClient.set('key', 'value');

    // Redis에서 값 가져오기
    const value = await redisClient.get('key');

    // 값 검증
    expect(value).toBe('value');
  });

  test('존재하지 않는 키 처리', async () => {
    // 존재하지 않는 키 가져오기
    const value = await redisClient.get('non-existing-key');

    // 값 검증
    expect(value).toBeNull();
  });

  test('connected_clients 확인해보기', async () => {
    const queryResult = await container.executeCliCmd('info', ['clients']);
    const connectedClientsMatch = queryResult.match(/connected_clients:(\d+)/);

    if (connectedClientsMatch) {
      const connectedClients = parseInt(connectedClientsMatch[1], 10);
      console.log(`Connected Clients: ${connectedClients}`);

      expect(connectedClients).toBeGreaterThanOrEqual(1);
    } else {
      console.error('Unable to retrieve connected_clients info');
    }
  });
});
