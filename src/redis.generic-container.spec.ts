import { GenericContainer, StartedTestContainer } from 'testcontainers';
import Redis from 'ioredis';

jest.setTimeout(1000000);

describe('redis generic-container test', () => {
  let container: StartedTestContainer;
  let redisClient: Redis;

  beforeAll(async () => {
    // Redis 컨테이너 생성 및 시작
    container = await new GenericContainer('redis')
      .withExposedPorts(6379)
      .start();

    const port = container.getMappedPort(6379);
    const host = container.getHost();

    // Redis 클라이언트 초기화
    redisClient = new Redis({
      host,
      port,
    });

    // 클라이언트가 이미 연결되어 있거나 연결 중인지 확인
    // RedisStatus = "wait" | "reconnecting" | "connecting" | "connect" | "ready" | "close" | "end";
    if (redisClient.status !== 'connecting') {
      await redisClient.connect();
    }
  });

  // beforeEach(async () => {
  //   // Redis 초기화 (필요에 따라 수행)
  //   await redisClient.flushall(); // 모든 키 삭제
  // });

  afterAll(async () => {
    // Redis 클라이언트 연결 종료 및 컨테이너 중지
    await redisClient.quit();
    await container.stop();
  });

  test('Redis에 값을 설정하고 가져오기', async () => {
    // Redis에 값 설정
    await redisClient.set('key', 'value');

    // Redis에서 값 가져오기
    const value = await redisClient.get('key');

    // 가져온 값이 예상 값인지 확인
    expect(value).toBe('value');
  });

  test('존재하지 않는 키 처리', async () => {
    // 존재하지 않는 키 가져오기
    const value = await redisClient.get('non-existing-key');

    // 가져온 값이 null인지 확인 (ioredis는 존재하지 않는 키에 대해 null을 반환함)
    expect(value).toBe(null);
  });
});
